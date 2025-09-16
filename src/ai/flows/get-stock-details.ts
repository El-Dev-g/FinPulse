
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

const StockDetailsRequestSchema = z.object({
  symbol: z.string(),
});
export type StockDetailsRequest = z.infer<typeof StockDetailsRequestSchema>;

const StockHistoryItemSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

const StockDetailsResponseSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  dayLow: z.number(),
  dayHigh: z.number(),
  volume: z.number(),
  logo: z.string(),
  description: z.string(),
  sector: z.string(),
  industry: z.string(),
  ceo: z.string(),
  history: z.array(StockHistoryItemSchema),
});
export type StockDetailsResponse = z.infer<typeof StockDetailsResponseSchema>;

export async function getStockDetails(
  input: StockDetailsRequest
): Promise<StockDetailsResponse> {
  return getStockDetailsFlow(input);
}

const fetchStockDataTool = ai.defineTool(
  {
    name: "fetchStockData",
    description:
      "Fetches quote, profile, and historical data for a stock symbol from the Alpha Vantage API.",
    inputSchema: StockDetailsRequestSchema,
    outputSchema: StockDetailsResponseSchema,
  },
  async ({ symbol }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error("Alpha Vantage API key is not configured.");
    }

    try {
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
      const historyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${apiKey}`;
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

      const [overviewResponse, historyResponse, quoteResponse] = await Promise.all([
        axios.get(overviewUrl),
        axios.get(historyUrl),
        axios.get(quoteUrl),
      ]);
      
      const overviewData = overviewResponse.data;
      const historyData = historyResponse.data['Time Series (Daily)'];
      const quoteData = quoteResponse.data['Global Quote'];

      if (!overviewData || Object.keys(overviewData).length === 0) {
        throw new Error(`No overview data found for symbol: ${symbol}`);
      }
      if (!historyData || Object.keys(historyData).length === 0) {
         console.warn(`No historical data for symbol: ${symbol}`);
      }
      if (!quoteData || Object.keys(quoteData).length === 0) {
         console.warn(`No quote data for symbol: ${symbol}`);
      }

      const history = historyData ? Object.entries(historyData).map(([date, data]: [string, any]) => ({
        date: date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['6. volume'], 10),
      })).slice(0, 90).reverse() : [];


      return {
        symbol,
        name: overviewData.Name || symbol,
        price: parseFloat(quoteData?.['05. price']) || 0,
        change: parseFloat(quoteData?.['09. change']) || 0,
        dayLow: parseFloat(quoteData?.['04. low']) || 0,
        dayHigh: parseFloat(quoteData?.['03. high']) || 0,
        volume: parseInt(quoteData?.['06. volume'], 10) || 0,
        logo: "", // Alpha Vantage free tier doesn't provide logos
        description: overviewData.Description || "",
        sector: overviewData.Sector || "",
        industry: overviewData.Industry || "",
        ceo: overviewData.CEO || "",
        history,
      };
    } catch (error: any) {
      console.error(`Failed to fetch all data for symbol ${symbol}:`, error.message);
      throw new Error(
        `Could not load data for ${symbol}. The API may be unavailable or the symbol may be invalid.`
      );
    }
  }
);


const getStockDetailsFlow = ai.defineFlow(
  {
    name: 'getStockDetailsFlow',
    inputSchema: StockDetailsRequestSchema,
    outputSchema: StockDetailsResponseSchema,
  },
  async (input) => {
    return await fetchStockDataTool(input);
  }
);
