
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
    name: 'fetchStockData',
    description:
      'Fetches quote, profile, and historical data for a stock symbol from the Financial Modeling Prep API (stable endpoints).',
    inputSchema: StockDetailsRequestSchema,
    outputSchema: StockDetailsResponseSchema,
  },
  async ({ symbol }) => {
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!apiKey) {
      throw new Error('Financial Modeling Prep API key is not configured.');
    }

    try {
      const historyUrl = `https://financialmodelingprep.com/stable/historical-price?symbol=${symbol}&limit=90&apikey=${apiKey}`;
      const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${apiKey}`;

      const [historyResponse, profileResponse] = await Promise.all([
        axios.get(historyUrl),
        axios.get(profileUrl),
      ]);

      const historyData = Array.isArray(historyResponse.data)
        ? historyResponse.data
        : [];
      const profileData = Array.isArray(profileResponse.data)
        ? profileResponse.data[0]
        : null;

      if (historyData.length === 0 || !profileData) {
        throw new Error(`No historical or profile data for symbol: ${symbol}`);
      }

      const today = historyData[0]; // most recent trading day
      const yesterday = historyData[1]; // previous trading day
      const change =
        today && yesterday ? today.close - yesterday.close : 0;

      return {
        symbol,
        name: profileData.companyName || symbol,
        price: today?.close || 0,
        change,
        dayLow: today?.low || 0,
        dayHigh: today?.high || 0,
        volume: today?.volume || 0,
        logo: profileData.image || '',
        description: profileData.description || '',
        sector: profileData.sector || '',
        industry: profileData.industry || '',
        ceo: profileData.ceo || '',
        history: historyData
          .map((item: any) => ({
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
          }))
          .reverse(),
      };
    } catch (error) {
      console.error(`Failed to fetch all data for symbol ${symbol}:`, error);
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
