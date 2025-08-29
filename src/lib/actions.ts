
"use server";

import {
  getPersonalizedFinancialAdvice,
  type PersonalizedFinancialAdviceInput,
} from "@/ai/flows/personalized-financial-advice";

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
