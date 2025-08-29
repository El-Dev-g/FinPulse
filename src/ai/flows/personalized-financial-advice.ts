// src/ai/flows/personalized-financial-advice.ts
'use server';

/**
 * @fileOverview Provides personalized financial advice based on spending habits and financial goals.
 *
 * - getPersonalizedFinancialAdvice - A function that generates personalized financial advice.
 * - PersonalizedFinancialAdviceInput - The input type for the getPersonalizedFinancialAdvice function.
 * - PersonalizedFinancialAdviceOutput - The return type for the getPersonalizedFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFinancialAdviceInputSchema = z.object({
  spendingHabits: z
    .string()
    .describe('Description of the user spending habits.'),
  financialGoals: z
    .string()
    .describe('Description of the user financial goals.'),
});
export type PersonalizedFinancialAdviceInput = z.infer<
  typeof PersonalizedFinancialAdviceInputSchema
>;

const AdviceDetailsSchema = z.object({
  title: z.string().describe("A catchy, concise title for the financial advice (e.g., 'Supercharge Your Savings')."),
  subtitle: z.string().describe("A brief, one-sentence summary of the core advice strategy."),
  steps: z.array(z.string()).describe("An array of 3-5 actionable, numbered steps or points for the user to follow."),
});

const PersonalizedFinancialAdviceOutputSchema = z.object({
  advice: AdviceDetailsSchema.describe('Personalized financial advice for the user, structured with a title, subtitle, and steps.'),
});
export type PersonalizedFinancialAdviceOutput = z.infer<
  typeof PersonalizedFinancialAdviceOutputSchema
>;

export async function getPersonalizedFinancialAdvice(
  input: PersonalizedFinancialAdviceInput,
  model: string
): Promise<PersonalizedFinancialAdviceOutput> {
  const flowInput = { ...input, model };
  return personalizedFinancialAdviceFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'personalizedFinancialAdvicePrompt',
  input: {schema: PersonalizedFinancialAdviceInputSchema},
  output: {schema: PersonalizedFinancialAdviceOutputSchema},
  prompt: `You are a friendly and encouraging financial advisor. Provide personalized financial advice to the user based on their spending habits and financial goals.

The advice should be structured with a clear title, a short subtitle, and a list of 3-5 concrete, actionable steps.

Spending Habits: {{{spendingHabits}}}
Financial Goals: {{{financialGoals}}}

Generate the structured advice.`,
});

const personalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedFinancialAdviceFlow',
    inputSchema: PersonalizedFinancialAdviceInputSchema.extend({ model: z.string() }),
    outputSchema: PersonalizedFinancialAdviceOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input, { model: input.model as any });
      return output!;
    } catch (e) {
      console.error('AI model failed to generate a response.', e);
      // Re-throw the original error to provide specific feedback to the user
      throw e;
    }
  }
);
