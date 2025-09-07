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

  // Using a free API that does not require an access key
  const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.message || `API call failed with status: ${response.status}`;
        throw new Error(errorMessage);
    }
    const data = await response.json();
    
    const convertedAmount = data?.rates?.[to];
    if (typeof convertedAmount !== 'number') {
        throw new Error("Could not retrieve converted amount from API response.");
    }
    
    return { convertedAmount };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
