
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

  const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Currency conversion service is not configured. Missing API key."
    );
  }

  const pair = `${from}${to}`;
  const url = `https://financialmodelingprep.com/stable/fx?pair=${pair}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const fxData = Array.isArray(response.data) ? response.data[0] : null;

    if (!fxData || !fxData.price) {
      throw new Error(`No FX data available for pair ${pair}`);
    }

    const convertedAmount = amount * fxData.price;
    return { from, to, amount, rate: fxData.price, convertedAmount };
  } catch (error: any) {
    console.error(`Error converting currency ${from} -> ${to}`, error);
    throw new Error(`Currency conversion failed: ${error.message || error}`);
  }
}
