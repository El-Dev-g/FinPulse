
'use server';
/**
 * @fileOverview A personalized financial advisor AI agent.
 *
 * - getPersonalizedFinancialAdvice - A function that handles the financial planning process.
 * - FinancialAdviceRequest - The input type for the getPersonalizedFinancialAdvice function.
 * - FinancialAdviceResponse - The return type for the getPersonalizedFinancialAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FinancialAdviceRequestSchema = z.object({
  prompt: z.string().describe('The user\'s financial situation and goals.'),
});
export type FinancialAdviceRequest = z.infer<typeof FinancialAdviceRequestSchema>;

const FinancialAdviceResponseSchema = z.object({
  title: z.string().describe("A concise, encouraging title for the financial plan."),
  subtitle: z.string().describe("An inspiring one-sentence subtitle for the plan."),
  steps: z.array(z.string()).describe("An array of 3-5 actionable steps the user should take to achieve their goals."),
});
export type FinancialAdviceResponse = z.infer<typeof FinancialAdviceResponseSchema>;

export async function getPersonalizedFinancialAdvice(
  request: FinancialAdviceRequest
): Promise<FinancialAdviceResponse> {
  return getPersonalizedFinancialAdviceFlow(request);
}

const prompt = ai.definePrompt({
  name: 'getPersonalizedFinancialAdvicePrompt',
  input: { schema: FinancialAdviceRequestSchema },
  output: { schema: FinancialAdviceResponseSchema },
  prompt: `You are an expert financial advisor. A user has provided details about their financial situation and goals.
  Your task is to create a simple, actionable financial plan for them. The plan should have a clear title, an inspiring subtitle, and 3-5 concrete steps.
  Analyze the user's request and generate a personalized plan.

  User's situation and goals:
  {{{prompt}}}`,
});

const getPersonalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'getPersonalizedFinancialAdviceFlow',
    inputSchema: FinancialAdviceRequestSchema,
    outputSchema: FinancialAdviceResponseSchema,
  },
  async (input) => {
    const { output } = await prompt({
        prompt: input.prompt,
    }, {model: 'googleai/gemini-1.5-flash'});
    return output!;
  }
);
