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

  // Note: This API's free plan only supports EUR as the base currency.
  // We will fetch all rates against EUR and then perform the conversion manually.
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error("Exchange rate API key not configured.");
  }
  
  const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=${from},${to}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
        throw new Error(`API Error: ${data.error?.info || 'Unknown error'}`);
    }

    const fromRate = data.rates[from];
    const toRate = data.rates[to];
    
    if (!fromRate || !toRate) {
        throw new Error("Could not retrieve exchange rates for the selected currencies.");
    }
    
    // Convert from 'from' currency to EUR, then from EUR to 'to' currency
    const amountInEur = amount / fromRate;
    const convertedAmount = amountInEur * toRate;

    return { convertedAmount };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
