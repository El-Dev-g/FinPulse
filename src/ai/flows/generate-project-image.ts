
'use server';
/**
 * @fileOverview A flow to generate a project image using a placeholder service.
 *
 * - generateProjectImage - A function that generates an image for a project based on its name.
 * - GenerateProjectImageRequest - The input type for the generateProjectImage function.
 * - GenerateProjectImageResponse - The return type for the generateProjectImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sha256 } from 'js-sha256';

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
    // Using a placeholder image service to avoid rate limits on the free tier.
    // We'll create a semi-unique seed from the project name.
    const hash = sha256(projectName);
    const seed = parseInt(hash.substring(0, 5), 16) % 1000; // Use a part of the hash as a seed
    
    const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;

    return { imageUrl };
  }
);
