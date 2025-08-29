
"use server";

import {
  getPersonalizedFinancialAdvice,
  type PersonalizedFinancialAdviceInput,
} from "@/ai/flows/personalized-financial-advice";
import {
  categorizeTransaction,
  type CategorizeTransactionInput,
} from "@/ai/flows/categorize-transaction";


export async function generateAdviceAction(
  input: PersonalizedFinancialAdviceInput
) {
  try {
    const result = await getPersonalizedFinancialAdvice(input);
    return {
      success: true,
      advice: result.advice,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "An error occurred while getting advice. Please try again.",
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
