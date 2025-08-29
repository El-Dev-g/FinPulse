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

const PersonalizedFinancialAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized financial advice for the user.'),
});
export type PersonalizedFinancialAdviceOutput = z.infer<
  typeof PersonalizedFinancialAdviceOutputSchema
>;

export async function getPersonalizedFinancialAdvice(
  input: PersonalizedFinancialAdviceInput
): Promise<PersonalizedFinancialAdviceOutput> {
  return personalizedFinancialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFinancialAdvicePrompt',
  input: {schema: PersonalizedFinancialAdviceInputSchema},
  output: {schema: PersonalizedFinancialAdviceOutputSchema},
  prompt: `You are a financial advisor. Provide personalized financial advice to the user based on their spending habits and financial goals.

Spending Habits: {{{spendingHabits}}}
Financial Goals: {{{financialGoals}}}

Advice:`,
});

const personalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedFinancialAdviceFlow',
    inputSchema: PersonalizedFinancialAdviceInputSchema,
    outputSchema: PersonalizedFinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
