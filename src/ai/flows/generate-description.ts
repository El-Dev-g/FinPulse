
'use server';
/**
 * @fileOverview An AI flow to generate a financial situation description based on user goals.
 *
 * - generateDescription - A function that generates a detailed description for the AI advisor.
 * - GenerateDescriptionRequest - The input type for the generateDescription function.
 * - GenerateDescriptionResponse - The return type for the generateDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Goal } from '@/lib/types';

const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  current: z.number(),
  target: z.number(),
  status: z.enum(['active', 'archived']),
  createdAt: z.any(),
  advice: z.any().optional(),
});

const GenerateDescriptionRequestSchema = z.object({
  activeGoals: z.array(GoalSchema).describe('The user\'s current, active financial goals.'),
  archivedGoals: z.array(GoalSchema).describe("The user's past goals that have been archived or deleted."),
});
export type GenerateDescriptionRequest = z.infer<typeof GenerateDescriptionRequestSchema>;

const GenerateDescriptionResponseSchema = z.object({
  description: z.string().describe("The generated, detailed description of the user's financial situation to be used as a prompt for the AI Advisor."),
});
export type GenerateDescriptionResponse = z.infer<typeof GenerateDescriptionResponseSchema>;

export async function generateDescription(
  request: GenerateDescriptionRequest
): Promise<GenerateDescriptionResponse> {
  return generateDescriptionFlow(request);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: { schema: GenerateDescriptionRequestSchema },
  output: { schema: GenerateDescriptionResponseSchema },
  prompt: `You are a helpful assistant. Your task is to generate a detailed and well-structured paragraph describing a user's financial situation based on their goals. This description will be used as a prompt for a financial advisor AI.

Analyze the user's active and archived (deleted) goals to create a narrative.

- Start with their current financial ambitions, referencing their active goals.
- Mention their past ambitions by referencing their archived goals, framing them as completed or changed priorities.
- Synthesize this information into a clear, descriptive paragraph.

**Example Output:**
"I am currently focused on several financial goals. My main priority is saving for a house down payment, for which I'm aiming for $50,000 and have saved $15,000 so far. I'm also building an emergency fund of $10,000, and I'm halfway there. In the past, I successfully saved up and paid for a $3,000 vacation. I also had a goal to buy a new laptop but decided to archive it to focus on my housing goal. Based on this, I'm looking for advice on how to best allocate my savings to reach my down payment goal faster."

**User's Active Goals:**
{{#each activeGoals}}
- {{title}} (Target: {{target}}, Current: {{current}})
{{else}}
(No active goals)
{{/each}}

**User's Archived/Deleted Goals:**
{{#each archivedGoals}}
- {{title}} (Target: {{target}}, Current: {{current}})
{{else}}
(No archived goals)
{{/each}}

Generate the descriptive paragraph now.`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionRequestSchema,
    outputSchema: GenerateDescriptionResponseSchema,
  },
  async (input) => {
    const { output } = await prompt(input, { model: 'googleai/gemini-1.5-flash' });
    return output!;
  }
);
