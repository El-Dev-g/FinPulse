// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simulated function. In a real app, this would make a POST request to Truelayer's token endpoint.
async function exchangeCodeForToken(code: string, origin: string) {
    const clientId = process.env.TRUELAYER_CLIENT_ID;
    const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;
    const redirectUri = `${origin}/api/truelayer/callback`; 

    console.log("---- Attempting to Exchange Code ----");
    console.log("Client ID:", clientId ? "Found" : "Missing");
    console.log("Client Secret:", clientSecret ? "Found" : "Missing");
    console.log("Redirect URI:", redirectUri);
    console.log("Authorization Code:", code);
    
    if (!clientId || !clientSecret) {
        throw new Error("Truelayer client credentials are not configured on the server.");
    }
    
    // In a real application, you would use `fetch` to make a POST request:
    /*
    const response = await fetch('https://auth.truelayer-sandbox.com/connect/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code: code,
        }),
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to exchange code for token: ${errorBody}`);
    }

    const data = await response.json();
    return data.access_token;
    */

    // For this prototype, we'll just simulate success and return a mock token.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return `mock_access_token_for_${code.slice(0, 8)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const redirectUrl = new URL('/dashboard/link-account', origin);

  if (error) {
    redirectUrl.searchParams.set('error', `truelayer_error_${error}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set('error', 'truelayer_missing_code');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange the code for an access token from your backend.
    const accessToken = await exchangeCodeForToken(code, origin);
    
    // In a real application, you would save this token securely to the database,
    // associated with the currently logged-in user.
    console.log(`Successfully obtained mock access token: ${accessToken}`);
    
    // After successfully getting a token and storing it, redirect the user back.
    redirectUrl.searchParams.set('success', 'truelayer_connected');
    return NextResponse.redirect(redirectUrl);

  } catch (e: any) {
    console.error("Token exchange failed:", e.message);
    redirectUrl.searchParams.set('error', 'truelayer_token_exchange_failed');
    return NextResponse.redirect(redirectUrl);
  }
}
