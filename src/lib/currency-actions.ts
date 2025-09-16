// src/lib/currency-actions.ts
"use server";

import { z } from "zod";
import axios from 'axios';

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

  const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;

  if (!apiKey) {
    throw new Error("Currency conversion service is not configured. Missing API key.");
  }
  
  const symbol = `${from}${to}`;
  const url = `https://financialmodelingprep.com/api/v3/fx/${symbol}?apikey=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.length === 0) {
      throw new Error(`No exchange rate found for the pair ${from}/${to}.`);
    }

    const rate = response.data[0].rate;
    if (typeof rate !== 'number') {
        throw new Error("Failed to retrieve a valid exchange rate from API.");
    }
    
    return { convertedAmount: amount * rate };
  } catch (error: any) {
    console.error("Currency conversion error:", error);
    const errorMessage = error.response?.data?.['Error Message'] || error.message || "Failed to convert currency.";
    throw new Error(errorMessage);
  }
}
