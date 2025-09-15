
'use server';
/**
 * @fileOverview A flow to retrieve comprehensive details for a given stock symbol.
 *
 * - getStockDetails - Fetches company profile, quote, and historical data.
 * - StockDetailsRequest - Input schema for the flow.
 * - StockDetailsResponse - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

const StockDetailsRequestSchema = z.object({
  symbol: z.string().describe('The stock ticker symbol, e.g., AAPL.'),
});
export type StockDetailsRequest = z.infer<typeof StockDetailsRequestSchema>;

const HistoricalDataSchema = z.object({
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
  history: z.array(HistoricalDataSchema),
});
export type StockDetailsResponse = z.infer<typeof StockDetailsResponseSchema>;

// This is a tool that the flow will use. It's not exported.
const fetchStockDataTool = ai.defineTool(
  {
    name: 'fetchStockData',
    description: 'Fetches quote, profile, and historical data for a stock symbol from the Financial Modeling Prep API.',
    inputSchema: z.object({
      symbol: z.string(),
    }),
    outputSchema: StockDetailsResponseSchema,
  },
  async ({ symbol }) => {
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!apiKey) {
      throw new Error('Financial Modeling Prep API key is not configured.');
    }

    try {
      const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
      const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
      const historyUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=90&apikey=${apiKey}`;
      
      const [quoteResponse, profileResponse, historyResponse] = await Promise.all([
        axios.get(quoteUrl),
        axios.get(profileUrl),
        axios.get(historyUrl),
      ]);

      const quoteData = quoteResponse.data?.[0];
      const profileData = profileResponse.data?.[0];
      const historyData = historyResponse.data?.historical || [];
      
      if (!quoteData || !profileData) {
        throw new Error(`No quote or profile data returned for symbol: ${symbol}`);
      }

      return {
        symbol: symbol,
        name: profileData.companyName || symbol,
        price: quoteData.price || 0,
        change: quoteData.change || 0,
        dayLow: quoteData.dayLow || 0,
        dayHigh: quoteData.dayHigh || 0,
        volume: quoteData.volume || 0,
        logo: profileData.image || '',
        description: profileData.description || "",
        sector: profileData.sector || "",
        industry: profileData.industry || "",
        ceo: profileData.ceo || "",
        history: Array.isArray(historyData) ? historyData.map((item: any) => ({
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
        })).reverse() : [],
      };
    } catch (error) {
      console.error(`Failed to fetch all data for symbol ${symbol}:`, error);
      throw new Error(`Could not load data for ${symbol}. The API may be unavailable or the symbol may be invalid.`);
    }
  }
);

const getStockDetailsFlow = ai.defineFlow(
  {
    name: 'getStockDetailsFlow',
    inputSchema: StockDetailsRequestSchema,
    outputSchema: StockDetailsResponseSchema,
    tools: [fetchStockDataTool]
  },
  async (input) => {
    return await fetchStockDataTool(input);
  }
);


export async function getStockDetails(
  request: StockDetailsRequest
): Promise<StockDetailsResponse> {
  return getStockDetailsFlow(request);
}
