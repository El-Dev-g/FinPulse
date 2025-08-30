// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const plugins = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
}

export const ai = genkit({
  plugins,
  logLevel: process.env.GENKIT_ENV === "dev" ? "debug" : "info",
  enableTracingAndMetrics: true,
});
