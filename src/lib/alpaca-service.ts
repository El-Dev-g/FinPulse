
// src/lib/alpaca-service.ts
import axios from 'axios';
import type { OrderParams } from './types';

// The base URL for trading and account management endpoints
const tradingApi = axios.create({
  baseURL: 'https://paper-api.alpaca.markets',
});

// The base URL for market data endpoints
const dataApi = axios.create({
  baseURL: 'https://data.alpaca.markets',
});

const getHeaders = () => {
  const keyId = process.env.NEXT_PUBLIC_APCA_API_KEY_ID;
  const secretKey = process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY;

  if (!keyId || !secretKey) {
    throw new Error('Alpaca API keys are not configured in environment variables.');
  }

  return {
    'APCA-API-KEY-ID': keyId,
    'APCA-API-SECRET-KEY': secretKey,
    'Content-Type': 'application/json',
  };
};

const makeApiCall = async (apiInstance: typeof tradingApi | typeof dataApi, config: any) => {
    try {
        const headers = getHeaders();
        const response = await apiInstance({ ...config, headers });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
             const alpacaError = error.response.data?.message || `An unknown Alpaca API error occurred: ${error.message}`;
             throw new Error(alpacaError);
        }
        throw error;
    }
}

// --- Account (Trading API) ---
export const getAccount = async () => {
    return makeApiCall(tradingApi, { url: '/v2/account', method: 'GET' });
};

// --- Portfolio (Trading API) ---
export const getPortfolioHistory = async (params: { period?: string; timeframe?: string; date_end?: string; extended_hours?: boolean; }) => {
    return makeApiCall(tradingApi, { url: '/v2/account/portfolio/history', method: 'GET', params });
};

// --- Positions (Trading API) ---
export const getPositions = async () => {
    return makeApiCall(tradingApi, { url: '/v2/positions', method: 'GET' });
};

// --- Assets (Trading API) ---
export const getAsset = async (symbol: string) => {
    // This calls GET /v2/assets/{symbol} which is the documented way to get a single asset by symbol
    return makeApiCall(tradingApi, { url: `/v2/assets/${symbol}`, method: 'GET' });
}


// --- Market Data (Data API) ---
export const getBars = async (params: { symbols: string[]; timeframe: string; start: string; end: string; }) => {
    return makeApiCall(dataApi, { url: '/v2/stocks/bars', method: 'GET', params: { ...params, symbols: params.symbols.join(','), feed: 'iex' } });
}

export const getNews = async (params: { symbols: string[]; limit?: number }) => {
    // Note: Using the Data API with v1beta1 for news
    return makeApiCall(dataApi, { url: '/v1beta1/news', method: 'GET', params: { ...params, symbols: params.symbols.join(',') } });
}

export const getLatestQuote = async (symbol: string) => {
    try {
        const data = await makeApiCall(dataApi, { url: `/v2/stocks/${symbol}/quotes/latest`, method: 'GET', params: { feed: 'iex' } });
        if (data && data.quote) {
            // Standardize the output to look like a bar object for consistency
            return { c: data.quote.ap }; 
        }
    } catch (e) {
        console.warn(`Alpaca IEX quote failed for ${symbol}, trying public fallback...`, e);
    }

    // Fallback to a public API if Alpaca fails or returns no quote
    try {
        const response = await axios.get(`https://api.frankfurter.app/latest?from=${symbol}&to=USD`);
        if (response.data && response.data.rates && response.data.rates.USD) {
            // Invert the rate to get the price of the stock in USD.
            const price = 1 / response.data.rates.USD;
            return { c: price }; // 'c' for close price, to match the 'bar' object structure
        }
    } catch (fallbackError) {
        console.error(`Public quote fallback failed for ${symbol}:`, fallbackError);
    }
    
    // If all else fails
    throw new Error(`Could not retrieve a price for ${symbol} from any available data source.`);
}


// --- Orders (Trading API) ---
export const createOrder = async (order: OrderParams) => {
    return makeApiCall(tradingApi, { url: '/v2/orders', method: 'POST', data: order });
}
