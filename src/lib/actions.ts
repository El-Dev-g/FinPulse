// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { answerQuestion } from "@/ai/flows/chatbot";
import { generateDescription } from "@/ai/flows/generate-description";
import { generateSmartAlerts } from "@/ai/flows/generate-smart-alerts";
import { getStockDetails as getStockDetailsFlow } from "@/ai/flows/get-stock-details";
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


export async function getStockData(
  symbols: string[]
): Promise<
  {
    symbol: string;
    name: string;
    price: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    volume: number;
    logo: string;
  }[]
> {
  if (symbols.length === 0) {
    return [];
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.error("Alpha Vantage API key is not configured.");
    throw new Error("Alpha Vantage API key is not configured.");
  }
  
  // Helper function to introduce a delay
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const results = [];
  for (const symbol of symbols) {
      try {
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
        
        const [quoteResponse, overviewResponse] = await Promise.all([
            axios.get(quoteUrl),
            axios.get(overviewUrl)
        ]);

        const quoteData = quoteResponse.data['Global Quote'];
        const overviewData = overviewResponse.data;

        if (!quoteData || Object.keys(quoteData).length === 0) {
          console.warn(`No quote data found for symbol: ${symbol}`);
          // Fallback using overview data if available
          results.push({
            symbol,
            name: overviewData?.Name || symbol,
            price: 0,
            change: 0,
            dayLow: 0,
            dayHigh: 0,
            volume: 0,
            logo: "",
          });
        } else {
           results.push({
            symbol: quoteData['01. symbol'],
            name: overviewData?.Name || quoteData['01. symbol'],
            price: parseFloat(quoteData['05. price']),
            change: parseFloat(quoteData['09. change']),
            dayLow: parseFloat(quoteData['04. low']),
            dayHigh: parseFloat(quoteData['03. high']),
            volume: parseInt(quoteData['06. volume'], 10),
            logo: "", // AlphaVantage free tier doesn't provide logos
          });
        }

      } catch (error: any) {
        // Handle API rate limit error specifically if possible
        if (error.response && error.response.data && /rate limit/i.test(JSON.stringify(error.response.data))) {
            console.warn(`Rate limit likely reached for Alpha Vantage. Symbol: ${symbol}`);
        } else {
            console.error(`Error fetching data for symbol: ${symbol}`, error.message);
        }
        results.push({ symbol, name: symbol, price: 0, change: 0, dayLow: 0, dayHigh: 0, volume: 0, logo: "" });
      }
      // The free Alpha Vantage API has a rate limit of 5 requests per minute and 100 per day.
      // We must add a delay between requests to avoid hitting the limit.
      await sleep(15000); // 15-second delay to stay under 5 requests per minute
  }


  return results;
}

export async function getStockDetails(symbol: string) {
    try {
        const details = await getStockDetailsFlow({ symbol });
        return { data: details, error: null };
    } catch(e: any) {
        return { data: null, error: e.message || "An unknown error occurred while fetching stock details." };
    }
}
