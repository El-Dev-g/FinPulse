// src/lib/alpaca-service.ts
import axios from 'axios';
import type { OrderParams } from './types';

// The base URL for all Alpaca API v2 requests.
const BASE_URL = 'https://paper-api.alpaca.markets';

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

const makeApiCall = async (config: any) => {
    const headers = getHeaders();
    try {
        const response = await axios({ ...config, baseURL: BASE_URL, headers });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const alpacaError = error.response?.data?.message || 'An unknown Alpaca API error occurred.';
            throw new Error(alpacaError);
        }
        throw error;
    }
}

// --- Account ---
export const getAccount = async () => {
    return makeApiCall({ url: '/v2/account', method: 'GET' });
};

// --- Portfolio ---
export const getPortfolioHistory = async (params: { period?: string; timeframe?: string; date_end?: string; extended_hours?: boolean; }) => {
    return makeApiCall({ url: '/v2/account/portfolio/history', method: 'GET', params });
};

// --- Positions ---
export const getPositions = async () => {
    return makeApiCall({ url: '/v2/positions', method: 'GET' });
};

// --- Assets ---
export const getAsset = async (symbol: string) => {
    return makeApiCall({ url: `/v2/assets/${symbol}`, method: 'GET' });
}

// --- Market Data ---
export const getBars = async (params: { symbols: string[]; timeframe: string; start: string; end: string; }) => {
    // Note: Market data endpoints have a different base URL
    return makeApiCall({ baseURL: 'https://data.alpaca.markets', url: '/v2/stocks/bars', method: 'GET', params: { ...params, symbols: params.symbols.join(',') } });
}

export const getNews = async (params: { symbols: string[]; limit?: number }) => {
     // Note: Market data endpoints have a different base URL
    return makeApiCall({ baseURL: 'https://data.alpaca.markets', url: '/v2/stocks/news', method: 'GET', params: { ...params, symbols: params.symbols.join(',') } });
}

// --- Orders ---
export const createOrder = async (order: OrderParams) => {
    return makeApiCall({ url: '/v2/orders', method: 'POST', data: order });
}
