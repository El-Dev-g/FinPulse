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
    return { convertedAmount: data.result };
  } catch (error) {
    console.error("Currency conversion error:", error);
    throw new Error("Failed to convert currency.");
  }
}
