// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { GENKIT_ENV } from "genkit/environment";

const plugins = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
}

export const ai = genkit({
  plugins,
  logLevel: GENKIT_ENV === "dev" ? "debug" : "info",
  enableTracingAndMetrics: true,
});
