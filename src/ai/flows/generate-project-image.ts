
'use server';
/**
 * @fileOverview A flow to generate a placeholder project image.
 *
 * - generateProjectImage - A function that returns a placeholder image for a project.
 * - GenerateProjectImageRequest - The input type for the generateProjectImage function.
 * - GenerateProjectImageResponse - The return type for the generateProjectImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateProjectImageRequestSchema = z.object({
  projectName: z.string().describe('The name of the financial project.'),
});
export type GenerateProjectImageRequest = z.infer<typeof GenerateProjectImageRequestSchema>;

const GenerateProjectImageResponseSchema = z.object({
  imageUrl: z.string().describe("The URL of the generated placeholder image."),
});
export type GenerateProjectImageResponse = z.infer<typeof GenerateProjectImageResponseSchema>;

export async function generateProjectImage(
  request: GenerateProjectImageRequest
): Promise<GenerateProjectImageResponse> {
  return generateProjectImageFlow(request);
}

const generateProjectImageFlow = ai.defineFlow(
  {
    name: 'generateProjectImageFlow',
    inputSchema: GenerateProjectImageRequestSchema,
    outputSchema: GenerateProjectImageResponseSchema,
  },
  async ({ projectName }) => {
    // Using picsum.photos for placeholder images as Imagen is a billed service.
    // The seed is based on the project name to have some consistency,
    // but a random element is added to ensure variety if names are similar.
    const seed = projectName.replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${seed}/600/400`;
    
    return { imageUrl };
  }
);
