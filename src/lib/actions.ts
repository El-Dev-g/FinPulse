// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { answerQuestion } from "@/ai/flows/chatbot";
import { generateDescription } from "@/ai/flows/generate-description";
import { generateSmartAlerts } from "@/ai/flows/generate-smart-alerts";
import { getBudgets, getCategories, getGoals, getRecurringTransactions, getTransactions } from "./db";
import type { Advice, Budget, Category, Goal, RecurringTransaction, Transaction } from "./types";
import { processBudgets } from "./utils";
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export async function getFinancialAdvice(prompt: string) {
  const advice = await getPersonalizedFinancialAdvice({ prompt });
  return advice;
}

export async function getCategorySuggestion(description: string, categories: string[]) {
  if (!description || description.trim().length < 3) {
    return null;
  }
  const suggestion = await suggestCategory({ description, categories });
  return suggestion;
}

export async function getChatbotResponse(query: string) {
    if (!query || query.trim().length < 3) {
        return { answer: "Please ask a more specific question." };
    }
    
    // Read the user guide and FAQ documentation
    const guidePath = path.join(process.cwd(), 'USER_GUIDE.md');
    const faqPath = path.join(process.cwd(), 'src/content/faq.json');
    
    const [guideContent, faqJson] = await Promise.all([
        fs.readFile(guidePath, 'utf-8'),
        fs.readFile(faqPath, 'utf-8'),
    ]);

    const faqData = JSON.parse(faqJson);
    const faqText = faqData.faqs.map((faq: { question: string; answer: string; }) => 
        `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n');

    const fullContext = `${guideContent}\n\n---
## Frequently Asked Questions
${faqText}
---`;
    
    const response = await answerQuestion({ query, context: fullContext });
    return response;
}


export async function generateAdvisorPrompt() {
    const goals = await getGoals('all') as Goal[];
    const activeGoals = goals.filter(g => g.status === 'active');
    const archivedGoals = goals.filter(g => g.status === 'archived');

    const result = await generateDescription({ activeGoals, archivedGoals });
    return result.description;
}


export type SmartAlert = {
    title: string;
    description: string;
    severity: "High" | "Medium" | "Low";
    actionableLink?: {
        text: string;
        href: string;
    };
};

export async function getSmartAlerts(): Promise<SmartAlert[]> {
    const [transactions, recurringTransactions, goals, budgets] = await Promise.all([
        getTransactions() as Promise<Transaction[]>,
        getRecurringTransactions() as Promise<RecurringTransaction[]>,
        getGoals('active') as Promise<Goal[]>,
        getBudgets() as Promise<Budget[]>,
    ]);
    
    const processedBudgets = processBudgets(budgets, transactions);

    const response = await generateSmartAlerts({
        transactions: transactions.slice(0, 50), // Send recent 50 transactions
        recurringTransactions,
        goals,
        budgets: processedBudgets,
    });
    
    return response.alerts;
}


export async function getStockData(symbols: string[]): Promise<{ symbol: string; price: number; logo: string; }[]> {
    if (symbols.length === 0) {
        return [];
    }

    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!apiKey) {
        console.error("Financial Modeling Prep API key is not configured.");
        throw new Error("Financial Modeling Prep API key is not configured.");
    }
    
    try {
        const symbolsString = symbols.join(',');
        const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${apiKey}`;
        const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbolsString}?apikey=${apiKey}`;

        const [quoteResponse, profileResponse] = await Promise.all([
            axios.get(quoteUrl),
            axios.get(profileUrl)
        ]);

        const quoteData = quoteResponse.data;
        const profileData = profileResponse.data;
        
        if (!quoteData || (Array.isArray(quoteData) && quoteData.length === 0)) {
            console.warn('FMP API returned empty quote data for symbols:', symbolsString);
            return symbols.map(s => ({ symbol: s, price: 0, logo: '' }));
        }
        
        // The API returns a single object if one symbol is requested, and an array otherwise.
        // We normalize this to always be an array.
        const quotes = Array.isArray(quoteData) ? quoteData : [quoteData];
        const profiles = Array.isArray(profileData) ? profileData : [profileData];

        return symbols.map(symbol => {
            const quote = quotes.find(q => q.symbol === symbol);
            const profile = profiles.find(p => p.symbol === symbol);
            return {
                symbol,
                price: quote?.price || 0,
                logo: profile?.image || '',
            };
        });
    } catch (error) {
        console.error('Failed to fetch stock data from FMP API:', error);
        throw new Error('Failed to fetch stock data.');
    }
}