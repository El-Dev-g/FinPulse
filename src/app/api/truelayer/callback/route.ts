// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function simulates the server-side exchange of an authorization code for an access token.
async function exchangeCodeForToken(code: string, redirectUri: string) {
    const clientId = process.env.TRUELAYER_CLIENT_ID;
    const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;

    console.log("---- Attempting to Exchange Code for Token ----");
    console.log("Client ID:", clientId ? "Found" : "Missing");
    console.log("Client Secret:", clientSecret ? "Found" : "Missing");
    console.log("Redirect URI for token exchange:", redirectUri);
    console.log("Authorization Code:", code);
    
    if (!clientId || !clientSecret) {
        throw new Error("Truelayer client credentials are not configured on the server.");
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
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // This is the final page the user will land on.
  const finalRedirectUrl = new URL('/dashboard/link-account', origin);

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

  try {
    // The redirect URI for the token exchange must EXACTLY match the one used in the initial auth URL.
    const redirectUriForToken = 'https://9000-firebase-studio-1756463262326.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev/api/truelayer/callback';
    
    const accessToken = await exchangeCodeForToken(code, redirectUriForToken);
    
    // In a real app, you would now save this `accessToken` securely to your database,
    // associated with the currently logged-in user. You would then use it to fetch
    // the user's account information and transactions.
    console.log(`Successfully obtained mock access token: ${accessToken}`);
    
    // Redirect the user back to the linking page with a success message.
    finalRedirectUrl.searchParams.set('success', 'truelayer_connected');
    return NextResponse.redirect(finalRedirectUrl);

  } catch (e: any) {
    console.error("Token exchange failed:", e.message);
    finalRedirectUrl.searchParams.set('error', 'truelayer_token_exchange_failed');
    return NextResponse.redirect(finalRedirectUrl);
  }
}
