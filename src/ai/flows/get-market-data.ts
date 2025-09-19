// This file is deprecated. Please use the functions in `src/lib/actions.ts` instead.
'use server';

// The logic from this file has been moved to src/lib/actions.ts to ensure
// proper environment variable loading for the Alpaca API.
// Genkit flows run in a separate context that was not picking up the .env file correctly.
// By moving this to a standard Next.js server action, we resolve the authentication issues.

export async function getMarketData() {
  throw new Error(
    'This function is deprecated. Use getPortfolio or getStockDetails from /lib/actions instead.'
  );
}

export async function placeOrder() {
  throw new Error(
    'This function is deprecated. Use submitOrder from /lib/actions instead.'
  );
}
