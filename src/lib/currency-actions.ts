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

  // Use the environment variable if available, otherwise use the provided fallback key.
  const accessKey = process.env.EXCHANGERATE_API_KEY || "e6bfac69f7921744c90ae5232156c465";

  if (!accessKey) {
    throw new Error("Currency conversion service is not configured. Missing API key.");
  }
  
  // Fetch live rates. Note: The free plan for exchangerate.host uses USD as the base currency.
  const url = `http://api.exchangerate.host/live?access_key=${accessKey}&source=USD&currencies=${from},${to}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.error?.info || errorData?.message || `API call failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    
    if (!data.success || !data.quotes) {
        throw new Error("Failed to retrieve valid exchange rates from API.");
    }
    
    const fromRate = data.quotes[`USD${from}`];
    const toRate = data.quotes[`USD${to}`];
    
    if (typeof fromRate !== 'number' || typeof toRate !== 'number') {
        throw new Error(`Could not find rates for ${from} or ${to}.`);
    }

    // Convert the amount from the 'from' currency to the base currency (USD),
    // then convert from USD to the 'to' currency.
    const amountInUsd = amount / fromRate;
    const convertedAmount = amountInUsd * toRate;

    return { convertedAmount };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
