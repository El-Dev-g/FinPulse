
// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function simulates the server-side exchange of an authorization code for an access token.
async function exchangeCodeForToken(code: string) {
    const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
    const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_TRUELAYER_REDIRECT_URI;

    console.log("---- Attempting to Exchange Code for Token ----");
    console.log("Client ID:", clientId ? "Found" : "Missing");
    console.log("Client Secret:", clientSecret ? "Found" : "Missing");
    console.log("Redirect URI for token exchange:", redirectUri);
    console.log("Authorization Code:", code);
    
    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error("Truelayer client credentials or redirect URI are not configured on the server.");
    }
    
    // In a real application, you would use `fetch` to make this POST request.
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
        console.error("Truelayer API Error:", errorBody);
        throw new Error(`Failed to exchange code for token. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully exchanged code for token:", data);
    return data.access_token;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const receivedState = searchParams.get('state');

  const finalRedirectUrl = new URL('/dashboard/link-account', process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin);

  if (error) {
    console.error("Truelayer callback error:", error);
    finalRedirectUrl.searchParams.set('error', `truelayer_error_${error}`);
    return NextResponse.redirect(finalRedirectUrl);
  }

  if (!code) {
    console.error("Missing authorization code from Truelayer.");
    finalRedirectUrl.searchParams.set('error', 'truelayer_missing_code');
    return NextResponse.redirect(finalRedirectUrl);
  }

  // A production app would store the state in a server-side session or a signed cookie to validate.
  // For this prototype, we'll just check that it exists.
  if (!receivedState) {
    console.warn("Missing state parameter from Truelayer. Skipping validation for prototype.");
    // In a real app, you would probably want to abort here.
    // finalRedirectUrl.searchParams.set('error', 'truelayer_missing_state');
    // return NextResponse.redirect(finalRedirectUrl);
  }


  try {
    const accessToken = await exchangeCodeForToken(code);
    
    console.log(`Successfully obtained access token: ${accessToken}`);
    
    finalRedirectUrl.searchParams.set('success', 'truelayer_connected');
    finalRedirectUrl.searchParams.set('state', receivedState); // Pass state back for client-side validation
    return NextResponse.redirect(finalRedirectUrl);

  } catch (e: any) {
    console.error("Token exchange failed:", e.message);
    finalRedirectUrl.searchParams.set('error', 'truelayer_token_exchange_failed');
    return NextResponse.redirect(finalRedirectUrl);
  }
}
