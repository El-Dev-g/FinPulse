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

  try {
    const response = await axios.get(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}&amount=${amount}`);
    
    if (!response.data.rates || !response.data.rates[to]) {
      throw new Error(`No exchange rate data available for the pair ${from}-${to}.`);
    }

    const rate = response.data.rates[to] / amount; // Calculate rate from converted amount
    const convertedAmount = response.data.rates[to];
    
    return { from, to, amount, rate, convertedAmount };
  } catch (error: any) {
    console.error(`Error converting currency ${from} -> ${to}`, error);
    // Use Alpha Vantage as a fallback
    console.log('Falling back to Alpha Vantage for currency conversion...');
    return convertCurrencyAlphaVantage(request);
  }
}


async function convertCurrencyAlphaVantage(
  request: z.infer<typeof ConvertCurrencyRequestSchema>
) {
  const { from, to, amount } = request;

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
      const note = response.data.Note;
      if (note && note.includes('limit')) {
        throw new Error('API rate limit reached for currency conversion.');
      }
      throw new Error(`No FX data available for pair ${from}-${to}.`);
    }

    const rate = parseFloat(fxData['5. Exchange Rate']);
    const convertedAmount = amount * rate;
    return { from, to, amount, rate, convertedAmount };
  } catch (error: any) {
    console.error(`Error converting currency ${from} -> ${to} with Alpha Vantage`, error);
    throw new Error(`Currency conversion failed: ${error.message || error}`);
  }
}
