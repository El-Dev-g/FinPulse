// src/lib/currency-actions.ts
"use server";

import { z } from "zod";

const ConvertCurrencyRequestSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
});

export async function convertCurrency(request: z.infer<typeof ConvertCurrencyRequestSchema>) {
  const parsedRequest = ConvertCurrencyRequestSchema.safeParse(request);
  if (!parsedRequest.success) {
    throw new Error("Invalid request");
  }

  const { from, to, amount } = parsedRequest.data;
  const apiKey = process.env.OPENEXCHANGERATES_API_KEY;

  if (!apiKey) {
    console.error("Open Exchange Rates API key not found.");
    // Return a mock response or throw an error if the API key is missing
    throw new Error("Currency conversion service is unavailable.");
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.result === "error") {
        throw new Error(`API Error: ${data['error-type']}`);
    }
    return { convertedAmount: data.conversion_result };
  } catch (error) {
    console.error("Currency conversion error:", error);
    throw new Error("Failed to convert currency.");
  }
}
