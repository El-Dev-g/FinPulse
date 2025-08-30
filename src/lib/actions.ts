// src/lib/actions.ts
"use server";

import { getPersonalizedFinancialAdvice } from "@/ai/flows/personalized-financial-advice";
import { updateGoal } from "./db";
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
