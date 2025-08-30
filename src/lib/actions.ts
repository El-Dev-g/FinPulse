
// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { answerQuestion } from "@/ai/flows/chatbot";
import { getCategories } from "./db";
import type { Advice, Category } from "./types";
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
    
    // Read the user guide documentation
    const guidePath = path.join(process.cwd(), 'USER_GUIDE.md');
    const context = await fs.readFile(guidePath, 'utf-8');
    
    const response = await answerQuestion({ query, context });
    return response;
}
