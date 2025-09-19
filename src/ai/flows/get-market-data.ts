
'use server';
/**
 * @fileOverview An AI flow for fetching market data and portfolio information from Alpaca.
 *
 * - getMarketData - Fetches portfolio, account, and stock details.
 * - placeOrder - Submits a trade order to Alpaca.
 */
import { z } from 'zod';
import {
  getAccount,
  getPortfolioHistory,
  getPositions,
  getAsset,
  getBars,
  getNews,
  createOrder,
} from '@/lib/alpaca-service';
import type { OrderParams } from '@/lib/types';
import { endOfDay, startOfDay, sub } from 'date-fns';

const MarketDataRequestSchema = z.object({
  dataType: z.enum(['portfolio', 'stock-details']),
  symbol: z.string().optional().describe('Stock symbol, required for stock-details.'),
});
export type MarketDataRequest = z.infer<typeof MarketDataRequestSchema>;

// Exported functions that call the flows
export async function getMarketData(request: MarketDataRequest) {
  if (request.dataType === 'portfolio') {
    const [account, positions, portfolioHistory] = await Promise.all([
      getAccount(),
      getPositions(),
      getPortfolioHistory({
        period: '3M',
        timeframe: '1D',
      }),
    ]);
    return {
      account: {
        ...account,
        equity_change_today: parseFloat(account.equity) - parseFloat(account.last_equity)
      },
      portfolio: positions,
      history: portfolioHistory,
    };
  }
  if (request.dataType === 'stock-details' && request.symbol) {
    const today = new Date();
    const [asset, bars, news] = await Promise.all([
      getAsset(request.symbol),
      getBars({
        symbols: [request.symbol],
        timeframe: '1Day',
        start: sub(startOfDay(today), { years: 1 }).toISOString(),
        end: endOfDay(today).toISOString(),
      }),
      getNews({
        symbols: [request.symbol],
        limit: 10,
      }),
    ]);
    return {
      asset,
      bars: bars[request.symbol] || [],
      news,
    };
  }
  throw new Error('Invalid request');
}

export async function placeOrder(order: OrderParams) {
  return createOrder(order);
}
