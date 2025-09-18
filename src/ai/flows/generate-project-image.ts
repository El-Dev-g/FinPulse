
'use server';
/**
 * @fileOverview A flow to generate a project image using AI.
 *
 * - generateProjectImage - A function that generates an image for a project based on its name.
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
  imageUrl: z.string().describe("The URL of the generated image as a data URI."),
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
    // Using the free-tier text-to-image model
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: `Generate a visually appealing and relevant image for a personal finance project named "${projectName}". The image should be a high-quality, photorealistic representation of the project's theme. For example, for "Kitchen Renovation", show a modern kitchen. For "Hawaii Vacation", show a beautiful Hawaiian beach. The image should be vibrant and inspiring.`,
      config: {
        responseModalities: ['IMAGE'],
      }
    });

    if (!media?.url) {
      throw new Error("AI failed to generate an image.");
    }
    
    return { imageUrl: media.url };
  }
);
