
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
  getLatestQuote,
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
    // Fetch latest quote separately for guaranteed price, even if bars are empty
    const [asset, bars, news, latestQuote] = await Promise.all([
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
      getLatestQuote(request.symbol),
    ]);
    
    const barsData = bars[request.symbol] || [];
    
    // If we have a latest quote but no bars, create a single bar entry for today
    if (latestQuote && barsData.length === 0) {
        barsData.push({
            t: new Date().toISOString(),
            o: latestQuote.c,
            h: latestQuote.c,
            l: latestQuote.c,
            c: latestQuote.c,
            v: 0,
        });
    }


    return {
      asset,
      bars: barsData,
      news,
      latestQuote: latestQuote, // Pass this down
    };
  }
  throw new Error('Invalid request');
}

export async function placeOrder(order: OrderParams) {
  return createOrder(order);
}
