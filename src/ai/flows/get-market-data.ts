
'use server';
/**
 * @fileOverview An AI flow for fetching market data and portfolio information from Alpaca.
 *
 * - getMarketData - Fetches portfolio, account, and stock details.
 * - placeOrder - Submits a trade order to Alpaca.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAlpacaClient } from '@/lib/alpaca';
import type { Position, Account, Bar, Order, News } from '@alpacahq/alpaca-trade-api/dist/resources/entities';

// Input Schema for getMarketData
const MarketDataRequestSchema = z.object({
  dataType: z.enum(['portfolio', 'stock-details']),
  symbol: z.string().optional().describe('Stock symbol, required for stock-details.'),
});
export type MarketDataRequest = z.infer<typeof MarketDataRequestSchema>;

// Output Schema for getMarketData
const MarketDataResponseSchema = z.object({
  account: z.any().optional().describe('Alpaca account details.'),
  portfolio: z.array(z.any()).optional().describe('Array of portfolio positions.'),
  asset: z.any().optional().describe('Asset details for a specific stock.'),
  bars: z.array(z.any()).optional().describe('Historical price bars for a stock.'),
  news: z.array(z.any()).optional().describe('Recent news articles for a stock.'),
});
export type MarketDataResponse = z.infer<typeof MarketDataResponseSchema>;

// Input Schema for placeOrder
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

// Output Schema for placeOrder
const OrderResponseSchema = z.any();
export type OrderResponse = z.infer<typeof OrderResponseSchema>;


const fetchAlpacaDataTool = ai.defineTool(
  {
    name: 'fetchAlpacaData',
    description: 'Fetches account, portfolio, and market data from the Alpaca API.',
    inputSchema: MarketDataRequestSchema,
    outputSchema: MarketDataResponseSchema,
  },
  async (input) => {
    const alpaca = getAlpacaClient();
    
    if (input.dataType === 'portfolio') {
      const [account, positions] = await Promise.all([
        alpaca.getAccount(),
        alpaca.getPositions(),
      ]);

      const portfolio = positions.map(pos => ({
        ...pos,
        unrealized_pl: parseFloat(pos.unrealized_pl),
        unrealized_plpc: parseFloat(pos.unrealized_plpc),
        market_value: parseFloat(pos.market_value),
        cost_basis: parseFloat(pos.cost_basis),
        qty: parseFloat(pos.qty),
      }));

      return { account, portfolio };
    }

    if (input.dataType === 'stock-details' && input.symbol) {
      const { symbol } = input;
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      const [asset, bars, news] = await Promise.all([
        alpaca.getAsset(symbol),
        alpaca.getBars({
          symbol,
          timeframe: '1Day',
          start: threeMonthsAgo.toISOString(),
          end: today.toISOString(),
        }),
        alpaca.getNews({ symbols: [symbol], limit: 10 }),
      ]);
      return { asset, bars, news };
    }

    throw new Error('Invalid dataType or missing symbol for stock-details.');
  }
);

const placeAlpacaOrderTool = ai.defineTool(
    {
        name: 'placeAlpacaOrder',
        description: 'Places a trade order with the Alpaca API.',
        inputSchema: OrderParamsSchema,
        outputSchema: OrderResponseSchema,
    },
    async (orderParams) => {
        const alpaca = getAlpacaClient();
        const order = await alpaca.createOrder(orderParams);
        return order;
    }
);


// Exported functions that call the flows
export async function getMarketData(request: MarketDataRequest): Promise<MarketDataResponse> {
  // This is a temporary measure to prevent the app from crashing.
  // The Alpaca package installation is failing.
  if (getAlpacaClient() === null) {
      throw new Error("Alpaca client is temporarily unavailable due to package installation issues.");
  }
  return marketDataFlow(request);
}

export async function placeOrder(order: OrderParams): Promise<OrderResponse> {
  if (getAlpacaClient() === null) {
      throw new Error("Alpaca client is temporarily unavailable due to package installation issues.");
  }
  return placeOrderFlow(order);
}


// Genkit Flows
const marketDataFlow = ai.defineFlow(
  {
    name: 'marketDataFlow',
    inputSchema: MarketDataRequestSchema,
    outputSchema: MarketDataResponseSchema,
  },
  async (input) => {
    return await fetchAlpacaDataTool(input);
  }
);

const placeOrderFlow = ai.defineFlow(
    {
        name: 'placeOrderFlow',
        inputSchema: OrderParamsSchema,
        outputSchema: OrderResponseSchema,
    },
    async (order) => {
        return await placeAlpacaOrderTool(order);
    }
)
