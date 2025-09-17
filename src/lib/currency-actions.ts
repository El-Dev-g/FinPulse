// src/lib/currency-actions.ts
"use server";

import axios from "axios";
import { z } from "zod";
import { ConvertCurrencyRequestSchema } from "@/lib/schemas";

export async function convertCurrency(
  request: z.infer<typeof ConvertCurrencyRequestSchema>
) {
  const parsedRequest = ConvertCurrencyRequestSchema.safeParse(request);
  if (!parsedRequest.success) {
    throw new Error("Invalid request format for currency conversion.");
  }

  const { from, to, amount } = parsedRequest.data;

  if (from === to) {
    return { from, to, amount, convertedAmount: amount };
  }
  
  // Using the Frankfurter API which sources data from the European Central Bank. No API key needed.
  const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`;

  try {
    const response = await axios.get(url);
    const fxData = response.data;

    if (!fxData.rates || !fxData.rates[to]) {
        throw new Error(`No FX data available for pair ${from}-${to}.`);
    }

    const rate = fxData.rates[to] / amount;
    const convertedAmount = fxData.rates[to];
    
    return { from, to, amount, rate, convertedAmount };

  } catch (error: any) {
    console.error(`Error converting currency ${from} -> ${to}`, error);
    // The Frankfurter API doesn't provide a good error message for invalid pairs, so we'll create one.
    if (error.response?.status === 422) {
      throw new Error(`Currency conversion failed: Invalid currency code provided.`);
    }
    throw new Error(`Currency conversion failed: ${error.message || 'Could not fetch exchange rate.'}`);
  }
}
