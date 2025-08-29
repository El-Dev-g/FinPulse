'use server';
/**
 * @fileOverview An AI agent for categorizing financial transactions.
 *
 * - categorizeTransaction - A function that suggests a category for a transaction.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
  categories: z
    .array(z.string())
    .describe('The list of possible categories to choose from.'),
});
export type CategorizeTransactionInput = z.infer<
  typeof CategorizeTransactionInputSchema
>;

const CategorizeTransactionOutputSchema = z.object({
  category: z
    .string()
    .describe('The suggested category for the transaction.'),
});
export type CategorizeTransactionOutput = z.infer<
  typeof CategorizeTransactionOutputSchema
>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are an expert at categorizing financial transactions. Based on the transaction description, select the most appropriate category from the provided list.

Transaction Description: {{{description}}}

Available Categories:
{{#each categories}}
- {{{this}}}
{{/each}}

Select one category.`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    // If there are no categories, we can't do anything.
    if (input.categories.length === 0) {
      return { category: '' };
    }
    
    try {
      const {output} = await prompt(input, {model: 'gemini-1.5-flash'});
      return output!;
    } catch (e) {
      console.error(e);
      throw new Error('The AI model failed to generate a response.', { cause: e });
    }
  }
);
