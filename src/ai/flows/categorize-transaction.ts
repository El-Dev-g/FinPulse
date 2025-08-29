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
import {googleAI} from '@genkit-ai/googleai';


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

const modelsToTry = [
  googleAI('gemini-2.5-flash'),
  googleAI('gemini-1.5-flash'),
];

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
    
    let lastError: any | undefined;
    for (const model of modelsToTry) {
      try {
        const {output} = await prompt(input, {model});
        return output!;
      } catch (e) {
        lastError = e;
        console.warn(
          `Failed to generate with ${model.name}, trying next model.`,
          e
        );
      }
    }

    throw new Error('All AI models failed to generate a response.', {
      cause: lastError,
    });
  }
);
