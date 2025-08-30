
'use server';
/**
 * @fileOverview An AI flow to suggest a spending category based on a transaction description.
 *
 * - suggestCategory - A function that suggests a financial category, creating one if necessary.
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
  isNew: z.boolean().describe("Whether the suggested category is a new one that doesn't exist in the provided list.")
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

First, analyze the user's transaction description.
Then, review the following list of existing categories:

{{#each categories}}
- {{{this}}}
{{/each}}

If the description fits well into one of the existing categories, choose that one and set 'isNew' to false.

If the description does NOT fit well into any of the existing categories, create a new, appropriate, and concise category name. For example, for "Monthly Netflix fee", a good new category would be "Subscriptions". For "Annual domain name renewal", a good new category would be "Digital Services". Set 'isNew' to true in this case.

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
    const { output } = await prompt(input, { model: 'googleai/gemini-1.5-flash' });
    return output!;
  }
);
