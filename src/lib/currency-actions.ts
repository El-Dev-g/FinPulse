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
  
  if (amount === 0) {
    return { convertedAmount: 0 };
  }

  // NOTE: This uses a free, public API. For production, use a reliable paid service.
  // This API does not require an API key.
  const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.success) {
        throw new Error(`API Error: ${data.error?.info || 'Unknown error'}`);
    }
    
    if (typeof data.result !== 'number') {
        throw new Error("Could not retrieve converted amount from API response.");
    }
    
    return { convertedAmount: data.result };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
