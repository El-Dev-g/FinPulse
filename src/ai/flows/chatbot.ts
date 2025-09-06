
'use server';
/**
 * @fileOverview An AI chatbot that answers questions based on provided context.
 *
 * - answerQuestion - A function that answers a user's query based on documentation.
 * - ChatbotRequest - The input type for the answerQuestion function.
 * - ChatbotResponse - The return type for the answerQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatbotRequestSchema = z.object({
  query: z.string().describe("The user's question."),
  context: z.string().describe("The documentation context to answer from."),
});
export type ChatbotRequest = z.infer<typeof ChatbotRequestSchema>;

const ChatbotResponseSchema = z.object({
  answer: z.string().describe("The chatbot's answer."),
});
export type ChatbotResponse = z.infer<typeof ChatbotResponseSchema>;

export async function answerQuestion(
  request: ChatbotRequest
): Promise<ChatbotResponse> {
  return chatbotFlow(request);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatbotRequestSchema },
  output: { schema: ChatbotResponseSchema },
  prompt: `You are a friendly and helpful chatbot for an application called FinPulse.
  Your goal is to answer visitor questions based *only* on the provided documentation.
  Do not make up information or answer questions that are outside of the documentation's scope.
  Your answer should be concise and directly address the user's question.
  If the answer is not in the documentation, politely state that you do not have that information.

  Documentation:
  ---
  {{{context}}}
  ---

  Visitor's Question:
  "{{{query}}}"`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotRequestSchema,
    outputSchema: ChatbotResponseSchema,
  },
  async (input) => {
    const { output } = await prompt(input, { model: 'googleai/gemini-1.5-flash' });
    return output!;
  }
);
