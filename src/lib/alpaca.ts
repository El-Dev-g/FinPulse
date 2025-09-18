// src/lib/alpaca.ts
// import Alpaca = require('@alpacahq/alpaca-trade-api');

// let alpaca: Alpaca;

export function getAlpacaClient(): any {
    throw new Error("Alpaca client is temporarily unavailable due to package installation issues.");
//   if (!alpaca) {
//     const paper = process.env.ALPACA_PAPER === 'true';
//     if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
//       throw new Error("Alpaca API keys are not configured in .env file.");
//     }
    
//     alpaca = new Alpaca({
//       keyId: process.env.ALPACA_API_KEY,
//       secretKey: process.env.ALPACA_SECRET_KEY,
//       paper: paper,
//     });
//   }
//   return alpaca;
}
