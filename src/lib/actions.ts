// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { getCategories } from "./db";
import type { Advice } from "./types";

export async function getFinancialAdvice(prompt: string) {
  const advice = await getPersonalizedFinancialAdvice({ prompt });
  return advice;
}

export async function getCategorySuggestion(description: string) {
  if (!description || description.trim().length < 3) {
    return null;
  }
  const categories = await getCategories();
  const categoryNames = categories.map((c) => c.name).filter(name => name !== 'Income'); // Exclude income from suggestions
  const suggestion = await suggestCategory({ description, categories: categoryNames });
  return suggestion;
}
