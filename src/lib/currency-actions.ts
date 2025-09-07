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
  
  // Use the /convert endpoint for direct conversion.
  const url = `http://api.exchangerate.host/convert?access_key=${accessKey}&from=${from}&to=${to}&amount=${amount}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.error?.info || errorData?.message || `API call failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    
    if (!data.success || typeof data.result !== 'number') {
        throw new Error("Failed to retrieve a valid conversion result from API.");
    }
    
    return { convertedAmount: data.result };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    throw new Error(error.message || "Failed to convert currency.");
  }
}
