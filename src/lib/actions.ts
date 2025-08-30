// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { suggestCategory } from "@/ai/flows/suggest-category";
import { getCategories, updateGoal } from "./db";
import { redirect } from "next/navigation";

export async function getFinancialAdvice(prompt: string, goalId: string | null) {
  const advice = await getPersonalizedFinancialAdvice({ prompt });

  if (goalId) {
    // If a goalId was provided, save the advice to that goal
    // and then redirect to the goals page to see it.
    await updateGoal(goalId, { advice });
    redirect(`/dashboard/goals?goalId=${goalId}&advice=${encodeURIComponent(JSON.stringify(advice))}`);
  }

  // Otherwise, just return the advice for display on the advisor page
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
