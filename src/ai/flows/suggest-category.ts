'use server';
/**
 * @fileOverview An AI flow to suggest a spending category based on a transaction description.
 *
 * - suggestCategory - A function that suggests a financial category.
 * - SuggestCategoryRequest - The input type for the suggestCategory function.
 * - SuggestCategoryResponse - The return type for the suggestCategory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestCategoryRequestSchema = z.object({
  description: z.string().describe('The description of the financial transaction.'),
  categories: z.array(z.string()).describe('The list of available categories to choose from.'),
});
export type SuggestCategoryRequest = z.infer<typeof SuggestCategoryRequestSchema>;

const SuggestCategoryResponseSchema = z.object({
  category: z.string().describe("The suggested category for the transaction."),
});
export type SuggestCategoryResponse = z.infer<typeof SuggestCategoryResponseSchema>;

export async function suggestCategory(
  request: SuggestCategoryRequest
): Promise<SuggestCategoryResponse> {
  return suggestCategoryFlow(request);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: { schema: SuggestCategoryRequestSchema },
  output: { schema: SuggestCategoryResponseSchema },
  prompt: `You are a helpful financial assistant. Your task is to suggest a spending category for a given transaction description.
  You must choose one of the following available categories:

  {{#each categories}}
  - {{{this}}}
  {{/each}}

  Analyze the user's transaction description and choose the most appropriate category from the list above.

  Transaction Description:
  {{{description}}}`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryRequestSchema,
    outputSchema: SuggestCategoryResponseSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
