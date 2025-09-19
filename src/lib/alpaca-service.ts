// src/lib/alpaca-service.ts
import axios from 'axios';
import type { OrderParams } from './types';

// The base URL for all Alpaca API v2 requests for trading, accounts, etc.
const tradeApi = axios.create({
  baseURL: 'https://paper-api.alpaca.markets/v2',
});

// The base URL for market data requests.
const dataApi = axios.create({
  baseURL: 'https://data.alpaca.markets/v2',
});


const getHeaders = () => {
  const keyId = process.env.APCA_API_KEY_ID;
  const secretKey = process.env.APCA_API_SECRET_KEY;

  if (!keyId || !secretKey) {
    throw new Error('Alpaca API keys are not configured in environment variables.');
  }

  return {
    'APCA-API-KEY-ID': keyId,
    'APCA-API-SECRET-KEY': secretKey,
    'Content-Type': 'application/json',
  };
};

const makeApiCall = async (instance: typeof tradeApi | typeof dataApi, config: any) => {
    try {
        const headers = getHeaders();
        const response = await instance({ ...config, headers });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const alpacaError = error.response?.data?.message || `An unknown Alpaca API error occurred: ${error.message}`;
            throw new Error(alpacaError);
        }
        throw error;
    }
}

// --- Account ---
export const getAccount = async () => {
    return makeApiCall(tradeApi, { url: '/account', method: 'GET' });
};

// --- Portfolio ---
export const getPortfolioHistory = async (params: { period?: string; timeframe?: string; date_end?: string; extended_hours?: boolean; }) => {
    return makeApiCall(tradeApi, { url: '/account/portfolio/history', method: 'GET', params });
};

// --- Positions ---
export const getPositions = async () => {
    return makeApiCall(tradeApi, { url: '/positions', method: 'GET' });
};

// --- Assets ---
export const getAsset = async (symbol: string) => {
    return makeApiCall(tradeApi, { url: `/assets/${symbol}`, method: 'GET' });
}

// --- Market Data ---
export const getBars = async (params: { symbols: string[]; timeframe: string; start: string; end: string; }) => {
    return makeApiCall(dataApi, { url: '/stocks/bars', method: 'GET', params: { ...params, symbols: params.symbols.join(','), feed: 'iex' } });
}

export const getNews = async (params: { symbols: string[]; limit?: number }) => {
    return makeApiCall(dataApi, { url: '/stocks/news', method: 'GET', params: { ...params, symbols: params.symbols.join(','), feed: 'iex' } });
}

// --- Orders ---
export const createOrder = async (order: OrderParams) => {
    return makeApiCall(tradeApi, { url: '/orders', method: 'POST', data: order });
}
