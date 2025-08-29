
"use server";

import {
  getPersonalizedFinancialAdvice,
  type PersonalizedFinancialAdviceInput,
} from "@/ai/flows/personalized-financial-advice";
import {
  categorizeTransaction,
  type CategorizeTransactionInput,
} from "@/ai/flows/categorize-transaction";
import { createGoalForAdvice } from "@/ai/flows/create-goal-for-advice";
import type { Advice } from "./types";


export async function generateAdviceAction(
  input: PersonalizedFinancialAdviceInput,
  model: string,
  goalId?: string | null
) {
  try {
    const advice : Advice = (await getPersonalizedFinancialAdvice(input, model)).advice;

    if (!goalId) {
      // If no goalId is provided, create/find the general advice goal
      const generalGoal = await createGoalForAdvice();
      return {
        success: true,
        advice: advice,
        goalId: generalGoal.id
      }
    }
    
    return {
      success: true,
      advice: advice,
      goalId: goalId,
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error.message || "An error occurred while getting advice. Please try again.",
    };
  }
}

export async function categorizeTransactionAction(
  input: CategorizeTransactionInput
) {
  try {
    const result = await categorizeTransaction(input);
    return {
      success: true,
      category: result.category,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "An error occurred while categorizing the transaction.",
    };
  }
}
