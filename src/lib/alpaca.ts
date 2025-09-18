// src/lib/alpaca.ts
// import Alpaca from '@alpacahq/alpaca-trade-api';

// let alpaca: Alpaca;

export function getAlpacaClient(): any {
    // This is a temporary measure.
    // The Alpaca package installation is failing, so we return null
    // to allow the calling code to handle the feature unavailability gracefully.
    return null;

    // if (!alpaca) {
    //     const paper = process.env.ALPACA_PAPER === 'true';
    //     if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
    //       throw new Error("Alpaca API keys are not configured in .env file.");
    //     }
        
    //     alpaca = new Alpaca({
    //       keyId: process.env.ALPACA_API_KEY,
    //       secretKey: process.env.ALPACA_SECRET_KEY,
    //       paper: paper,
    //     });
    // }
    // return alpaca;
}
