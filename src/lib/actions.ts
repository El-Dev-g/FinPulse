// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { answerQuestion } from "@/ai/flows/chatbot";
import { generateDescription } from "@/ai/flows/generate-description";
import { generateSmartAlerts } from "@/ai/flows/generate-smart-alerts";
import {
  getAccount,
  getPortfolioHistory,
  getPositions,
  getAsset,
  getBars,
  getNews,
  createOrder,
  getLatestQuote,
} from '@/lib/alpaca-service';
import { getBudgets, getCategories, getGoals, getRecurringTransactions, getTransactions, getInvestments, syncInvestments } from "./db";
import type { Advice, Budget, Category, Goal, RecurringTransaction, Transaction, OrderParams, Position, AlpacaAccount } from "./types";
import { processBudgets } from "./utils";
import fs from 'fs/promises';
import path from 'path';
import { endOfDay, startOfDay, sub } from "date-fns";

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
export async function getPortfolio(sync: boolean = false) {
    try {
        const dbInvestments = await getInvestments();
        if (sync || dbInvestments.length === 0) {
            console.log("Syncing portfolio from Alpaca...");
             const [account, positions, portfolioHistory] = await Promise.all([
                getAccount(),
                getPositions(),
                getPortfolioHistory({
                    period: '3M',
                    timeframe: '1D',
                }),
            ]);

            const alpacaData = {
                account: {
                    ...account,
                    equity_change_today: parseFloat(account.equity) - parseFloat(account.last_equity)
                },
                portfolio: positions,
                history: portfolioHistory,
            };

            if (alpacaData?.portfolio) {
                const positionsArray = Array.isArray(alpacaData.portfolio) ? alpacaData.portfolio : [];
                await syncInvestments(positionsArray as Position[]);
            }
            return { data: alpacaData, error: null };
        }

        console.log("Fetching portfolio from DB...");
        const accountInfo = await getAccount(); // Still need live account data
        const accountData = {
            ...accountInfo,
            equity_change_today: parseFloat(accountInfo.equity) - parseFloat(accountInfo.last_equity)
        };

        return { data: { portfolio: dbInvestments, account: accountData }, error: null };

    } catch(e: any) {
        console.error("Error in getPortfolio action:", e);
        return { data: null, error: e.message || "An unknown error occurred while fetching portfolio." };
    }
}

export async function getStockDetails(symbol: string) {
    try {
        const today = new Date();
        const [asset, bars, news, latestQuote] = await Promise.all([
            getAsset(symbol),
            getBars({
                symbols: [symbol],
                timeframe: '1Day',
                start: sub(startOfDay(today), { years: 1 }).toISOString(),
                end: endOfDay(today).toISOString(),
            }),
            getNews({
                symbols: [symbol],
                limit: 10,
            }),
            getLatestQuote(symbol),
        ]);
        
        const barsData = bars[symbol] || [];
        
        if (latestQuote && barsData.length === 0) {
            barsData.push({
                t: new Date().toISOString(),
                o: latestQuote.c,
                h: latestQuote.c,
                l: latestQuote.c,
                c: latestQuote.c,
                v: 0,
            });
        }
        
        const result = {
            asset,
            bars: barsData,
            news,
            latestQuote: latestQuote,
        };

        return { data: result, error: null };
    } catch(e: any) {
        return { data: null, error: e.message || "An unknown error occurred while fetching stock details." };
    }
}

export async function submitOrder(order: OrderParams) {
    try {
        const result = await createOrder(order);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s for Alpaca to process order
        await getPortfolio(true); 
        return { data: result, error: null };
    } catch (e: any) {
        return { data: null, error: e.message || "An unknown error occurred while placing the order." };
    }
}
