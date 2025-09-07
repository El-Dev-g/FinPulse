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

  // NOTE: This uses a free, public API that does not require a private API key.
  // This is a public demo key.
  const apiKey = 'ec1b281989480a4242e85031';
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.result === 'error') {
      throw new Error(data['error-type'] || 'An unknown API error occurred.');
    }
    
    if (typeof data.conversion_result !== 'number') {
        throw new Error("Could not retrieve converted amount from API response.");
    }
    
    return { convertedAmount: data.conversion_result };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
