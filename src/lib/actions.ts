
// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { answerQuestion } from "@/ai/flows/chatbot";
import { generateDescription } from "@/ai/flows/generate-description";
import { generateSmartAlerts } from "@/ai/flows/generate-smart-alerts";
import { getMarketData, placeOrder } from "@/ai/flows/get-market-data";
import { getBudgets, getCategories, getGoals, getRecurringTransactions, getTransactions } from "./db";
import type { Advice, Budget, Category, Goal, RecurringTransaction, Transaction, OrderParams } from "./types";
import { processBudgets } from "./utils";
import fs from 'fs/promises';
import path from 'path';

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


// New Alpaca-based market data functions
export async function getPortfolio() {
    try {
        const result = await getMarketData({ dataType: 'portfolio' });
        return { data: result, error: null };
    } catch(e: any) {
        return { data: null, error: e.message || "An unknown error occurred while fetching portfolio." };
    }
}

export async function getStockDetails(symbol: string) {
    try {
        const result = await getMarketData({ dataType: 'stock-details', symbol });
        return { data: result, error: null };
    } catch(e: any) {
        return { data: null, error: e.message || "An unknown error occurred while fetching stock details." };
    }
}

export async function submitOrder(order: OrderParams) {
    try {
        const result = await placeOrder(order);
        return { data: result, error: null };
    } catch (e: any) {
        return { data: null, error: e.message || "An unknown error occurred while placing the order." };
    }
}
