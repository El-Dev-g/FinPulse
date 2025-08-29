'use server';
/**
 * @fileOverview A flow to get or create a default goal for general financial advice.
 *
 * - createGoalForAdvice - A function that finds or creates a goal for storing general advice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getGoalByTitle, addGoal } from '@/lib/db';
import type { PersonalizedFinancialAdviceInput } from './personalized-financial-advice';

const GENERAL_ADVICE_GOAL_TITLE = "General Financial Advice";

// Define the output schema to match the Goal type from the database
const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  current: z.number(),
  target: z.number(),
});

export const createGoalForAdviceFlow = ai.defineFlow(
  {
    name: 'createGoalForAdviceFlow',
    inputSchema: z.any(),
    outputSchema: GoalSchema,
  },
  async (input: PersonalizedFinancialAdviceInput) => {
    // Check if the general advice goal already exists
    let goal = await getGoalByTitle(GENERAL_ADVICE_GOAL_TITLE);

    if (goal) {
      return goal;
    }

    // If not, create it
    const newGoal: Omit<Goal, 'id'> = {
      title: GENERAL_ADVICE_GOAL_TITLE,
      current: 0,
      target: 100, // A nominal target, as this is for advice storage
      createdAt: new Date(),
    };
    const newGoalId = await addGoal(newGoal);
    
    return { ...newGoal, id: newGoalId };
  }
);

export async function createGoalForAdvice(input: PersonalizedFinancialAdviceInput) {
    return await createGoalForAdviceFlow(input);
}
