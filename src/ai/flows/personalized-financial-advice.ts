// src/ai/flows/personalized-financial-advice.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "zod";

const PersonalizedFinancialAdviceInputSchema = z.object({
  financialSituation: z.string().describe("The user's current financial situation, including income, expenses, savings, and debts."),
  goal: z.string().describe("The user's primary financial goal."),
});
export type PersonalizedFinancialAdviceInput = z.infer<typeof PersonalizedFinancialAdviceInputSchema>;

const PersonalizedFinancialAdviceOutputSchema = z.object({
  title: z.string().describe("A catchy, optimistic title for the financial advice plan."),
  subtitle: z.string().describe("An encouraging one-sentence summary of the plan."),
  steps: z.array(z.string()).describe("A list of 3-5 actionable, concrete steps the user can take to achieve their goal."),
});
export type PersonalizedFinancialAdviceOutput = z.infer<typeof PersonalizedFinancialAdviceOutputSchema>;


export async function getPersonalizedFinancialAdvice(
  input: PersonalizedFinancialAdviceInput
): Promise<PersonalizedFinancialAdviceOutput> {
  return await personalizedFinancialAdviceFlow(input);
}


const prompt = ai.definePrompt({
  name: "personalizedFinancialAdvicePrompt",
  input: { schema: PersonalizedFinancialAdviceInputSchema },
  output: { schema: PersonalizedFinancialAdviceOutputSchema },
  prompt: `You are an expert financial advisor named 'FinPulse AI'. Your tone is encouraging, positive, and empowering.

  A user needs personalized financial advice.

  Their current financial situation is:
  "{{{financialSituation}}}"

  Their primary goal is:
  "{{{goal}}}"

  Analyze their situation and goal, then generate a simple, actionable financial plan. The plan should consist of a title, a brief subtitle, and a list of 3-5 concrete, easy-to-follow steps.

  Provide the output in the specified JSON format.
  `,
});


const personalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: "personalizedFinancialAdviceFlow",
    inputSchema: PersonalizedFinancialAdviceInputSchema,
    outputSchema: PersonalizedFinancialAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, { model: 'gemini-pro' });
    
    if (!output) {
      throw new Error("AI model failed to generate a response.");
    }
    
    return output;
  }
);
