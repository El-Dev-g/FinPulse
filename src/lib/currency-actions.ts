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
  
  const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;

  try {
    const response = await axios.get(url);
    const fxData = response.data;

    if (!fxData.success) {
        throw new Error(fxData.error?.info || `No FX data available for pair ${from}-${to}.`);
    }

    const rate = fxData.info.rate;
    const convertedAmount = fxData.result;
    
    return { from, to, amount, rate, convertedAmount };

  } catch (error: any) {
    console.error(`Error converting currency ${from} -> ${to}`, error);
    throw new Error(`Currency conversion failed: ${error.message || error}`);
  }
}
