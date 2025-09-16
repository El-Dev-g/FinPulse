
'use server';
/**
 * @fileOverview An AI flow to generate a project image based on its name.
 *
 * - generateProjectImage - A function that creates an image for a project.
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
  imageUrl: z.string().describe("The data URI of the generated image."),
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
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a visually appealing and relevant image for a personal finance project named "${projectName}". The image should be a high-quality, photorealistic representation of the project's theme. For example, for "Kitchen Renovation", show a modern kitchen. For "Hawaii Vacation", show a beautiful Hawaiian beach.`,
    });
    
    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error("Failed to generate project image.");
    }
    
    return { imageUrl };
  }
);
