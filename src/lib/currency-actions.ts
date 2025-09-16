
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

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Currency conversion service is not configured. Missing API key."
    );
  }

  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const fxData = response.data['Realtime Currency Exchange Rate'];

    if (!fxData || !fxData['5. Exchange Rate']) {
      throw new Error(`No FX data available for pair ${from}-${to}. This may be due to API rate limiting.`);
    }

    const rate = parseFloat(fxData['5. Exchange Rate']);
    const convertedAmount = amount * rate;
    return { from, to, amount, rate, convertedAmount };
  } catch (error: any) {
    console.error(`Error converting currency ${from} -> ${to}`, error);
    throw new Error(`Currency conversion failed: ${error.message || error}`);
  }
}
