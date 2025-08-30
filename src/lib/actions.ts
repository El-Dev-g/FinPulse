// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { getCategories, addAIPlan, updateGoal } from "./db";
import type { Advice } from "./types";

export async function getFinancialAdvice(prompt: string, goalId: string | null) {
  const advice = await getPersonalizedFinancialAdvice({ prompt });
  
  // Save all generated plans
  const planId = await addAIPlan({
    prompt,
    advice,
    goalId: goalId || undefined,
  });
  
  // If a goalId was provided, also save the advice to that goal
  if (goalId && goalId !== 'none') {
    await updateGoal(goalId, { advice });
  }

  return { advice, goalId };
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
