// src/lib/actions.ts
"use server";

import {
  getPersonalizedFinancialAdvice,
  PersonalizedFinancialAdviceInput,
  PersonalizedFinancialAdviceOutput,
} from "@/ai/flows/personalized-financial-advice";
import { getCategorySuggestion } from "@/ai/flows/categorize-transaction";

export async function generateAdviceAction(
  input: PersonalizedFinancialAdviceInput
): Promise<PersonalizedFinancialAdviceOutput> {
  return await getPersonalizedFinancialAdvice(input);
}

export async function suggestCategoryAction(
  description: string
): Promise<string> {
  return await getCategorySuggestion({ description });
}
