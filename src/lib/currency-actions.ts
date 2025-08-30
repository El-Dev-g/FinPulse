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

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error("Exchange rate API key not configured.");
  }
  
  const url = `https://api.exchangerate.host/live?access_key=${apiKey}&source=${from}&currencies=${to}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.success) {
        throw new Error(`API Error: ${data.error?.info || 'Unknown error'}`);
    }
    
    const rateKey = `${from}${to}`;
    const rate = data.quotes[rateKey];
    
    if (!rate) {
        throw new Error("Could not retrieve exchange rate for the selected currencies.");
    }
    
    const convertedAmount = amount * rate;

    return { convertedAmount };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
