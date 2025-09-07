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
  
  if (amount === 0 || from === to) {
    return { convertedAmount: amount };
  }

  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    throw new Error("Currency conversion service is not configured. Missing API key.");
  }
  
  const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}&access_key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.info || `API call failed with status: ${response.status}`;
        throw new Error(errorMessage);
    }
    const data = await response.json();
    
    if (data.success !== true || typeof data.result !== 'number') {
        throw new Error(data?.error?.info || "Could not retrieve converted amount from API response.");
    }
    
    return { convertedAmount: data.result };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
