
// src/lib/alpaca-service.ts
import axios from 'axios';
import type { OrderParams } from './types';

const BASE_URL = 'https://paper-api.alpaca.markets/v2';

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

const alpacaApi = axios.create({
  baseURL: BASE_URL,
});

// We need to intercept requests to add headers dynamically
alpacaApi.interceptors.request.use(config => {
    config.headers = { ...config.headers, ...getHeaders() };
    return config;
});

// --- Account ---
export const getAccount = async () => {
  const response = await alpacaApi.get('/account');
  return response.data;
};

// --- Portfolio ---
export const getPortfolioHistory = async (params: { period?: string; timeframe?: string; date_end?: string; extended_hours?: boolean; }) => {
    const response = await alpacaApi.get('/account/portfolio/history', { params });
    return response.data;
};

// --- Positions ---
export const getPositions = async () => {
  const response = await alpacaApi.get('/positions');
  return response.data;
};

// --- Assets ---
export const getAsset = async (symbol: string) => {
    const response = await alpacaApi.get(`/assets/${symbol}`);
    return response.data;
}

// --- Market Data ---
export const getBars = async (params: { symbols: string[]; timeframe: string; start: string; end: string; }) => {
    const response = await alpacaApi.get('/stocks/bars', { 
        params: {
            ...params,
            symbols: params.symbols.join(',')
        }
     });
    return response.data;
}

export const getNews = async (params: { symbols: string[]; limit?: number }) => {
    const response = await alpacaApi.get('/news', {
        params: {
            ...params,
            symbols: params.symbols.join(','),
        }
    });
    return response.data;
}

// --- Orders ---
export const createOrder = async (order: OrderParams) => {
    const response = await alpacaApi.post('/orders', order);
    return response.data;
}