// src/ai/flows/categorize-transaction.ts
"use server";

import { ai } from "@/ai/genkit";
import { getCategories } from "@/lib/db";
import { z } from "zod";

const CategorizeTransactionInputSchema = z.object({
  description: z.string().describe("The description of the financial transaction."),
});

const CategorizeTransactionOutputSchema = z.string().describe("The suggested category for the transaction.");

export async function getCategorySuggestion(
  input: z.infer<typeof CategorizeTransactionInputSchema>
): Promise<string> {
  return await categorizeTransactionFlow(input);
}

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: "categorizeTransactionFlow",
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async (input) => {
    const categories = (await getCategories()).map((c) => c.name);
    
    const prompt = ai.definePrompt({
        name: "categorizeTransactionPrompt",
        prompt: `You are an expert at categorizing financial transactions. Given a transaction description, suggest the most appropriate category from the following list.

        Available Categories:
        ${categories.join(", ")}

        Transaction Description: "{{{description}}}"

        Suggest only one category from the list. Do not add any extra text or explanation.`,
    });

    const { output } = await prompt(input, { model: 'gemini-pro' });
    
    if (!output) {
        return "Other";
    }

    // Basic validation to ensure the model returns a valid category
    const suggestedCategory = output.trim();
    if (categories.includes(suggestedCategory)) {
        return suggestedCategory;
    }

    return "Other"; // Default fallback
  }
);
