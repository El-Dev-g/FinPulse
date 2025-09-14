
// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { saveTruelayerToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const scope = searchParams.get('scope');

  if (!code) {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    console.error(`Truelayer auth error: ${error} - ${errorDescription}`);
    // Redirect to the linking page with an error message
    const redirectUrl = new URL('/dashboard/link-account', request.url);
    redirectUrl.searchParams.set('error', error || 'unknown_error');
    return NextResponse.redirect(redirectUrl);
  }
  
  const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
  const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;
  
  // Dynamically determine the redirect URI from the request headers
  const redirectUri = new URL('/api/truelayer/callback', request.url).toString();

  if (!clientId || !clientSecret) {
    console.error('Truelayer client credentials are not configured on the server.');
    const redirectUrl = new URL('/dashboard/link-account', request.url);
    redirectUrl.searchParams.set('error', 'server_config_error');
    return NextResponse.redirect(redirectUrl);
  }

  try {
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

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Truelayer API Error:", responseData);
      throw new Error(responseData.error_description || 'Failed to exchange code for token.');
    }

    await saveTruelayerToken({
        access_token: responseData.access_token,
        refresh_token: responseData.refresh_token,
        expires_in: responseData.expires_in,
        token_type: responseData.token_type,
        scope: responseData.scope,
    });
    
    console.log("Successfully exchanged code for token and saved to database.");

    // Redirect to the account linking page with a success indicator
    const redirectUrl = new URL('/dashboard/link-account', request.url);
    redirectUrl.searchParams.set('success', 'true');
    
    const responseRedirect = NextResponse.redirect(redirectUrl);
    
    return responseRedirect;

  } catch (error: any) {
    console.error("Token exchange failed:", error);
    const redirectUrl = new URL('/dashboard/link-account', request.url);
    redirectUrl.searchParams.set('error', 'token_exchange_failed');
    return NextResponse.redirect(redirectUrl);
  }
}
