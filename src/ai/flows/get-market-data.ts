
'use server';
/**
 * @fileOverview An AI flow for fetching market data and portfolio information from Alpaca.
 *
 * - getMarketData - Fetches portfolio, account, and stock details.
 * - placeOrder - Submits a trade order to Alpaca.
 */
import { z } from 'zod';

// NOTE: The Alpaca integration is temporarily disabled due to package installation issues.
// These functions will return an error until the issue is resolved.

const MarketDataRequestSchema = z.object({
  dataType: z.enum(['portfolio', 'stock-details']),
  symbol: z.string().optional().describe('Stock symbol, required for stock-details.'),
});
export type MarketDataRequest = z.infer<typeof MarketDataRequestSchema>;

const OrderParamsSchema = z.object({
  symbol: z.string(),
  qty: z.number(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  time_in_force: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok']),
  limit_price: z.number().optional(),
  stop_price: z.number().optional(),
});
export type OrderParams = z.infer<typeof OrderParamsSchema>;


const errorResponse = {
    account: null,
    portfolio: [],
    asset: null,
    bars: [],
    news: [],
    equity_change_today: "0",
};


// Exported functions that call the flows
export async function getMarketData(request: MarketDataRequest) {
  // Bypassing flow and tool to throw error immediately
  throw new Error("Alpaca client is temporarily unavailable due to package installation issues.");
}

export async function placeOrder(order: OrderParams) {
  // Bypassing flow and tool to throw error immediately
  throw new Error("Alpaca client is temporarily unavailable due to package installation issues.");
}
