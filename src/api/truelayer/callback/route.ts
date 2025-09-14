
// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const exchangeCodeRequestSchema = z.object({
  code: z.string(),
  code_verifier: z.string(),
});

// This is a new route handler for the client to call from the final redirect page.
// It securely handles the token exchange on the server-side.
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = exchangeCodeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
  }

  const { code, code_verifier } = parsed.data;

  const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
  const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;
  const redirect_uri = process.env.NEXT_PUBLIC_TRUELAYER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirect_uri) {
    return NextResponse.json({ error: 'Truelayer client credentials are not configured on the server.' }, { status: 500 });
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
        redirect_uri: redirect_uri,
        code: code,
        code_verifier: code_verifier,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Truelayer API Error:", responseData);
      return NextResponse.json({ error: 'Failed to exchange code for token.', details: responseData }, { status: response.status });
    }

    // IMPORTANT: In a real app, you would save the access_token and refresh_token
    // securely, associated with the user's account.
    console.log("Successfully exchanged code for token:", responseData);
    
    // For this prototype, we'll just confirm success. The client will handle showing the account selection.
    return NextResponse.json({ success: true, message: "Token exchanged successfully." });

  } catch (error: any) {
    console.error("Token exchange failed:", error);
    return NextResponse.json({ error: 'An internal server error occurred during token exchange.' }, { status: 500 });
  }
}


// This GET handler now just redirects the user to the final page with the code.
// The sensitive token exchange is handled by the POST request from that final page.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const finalRedirectUrl = new URL('/dashboard/link-account', request.nextUrl.origin);

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

  // Pass the code to the front-end to be exchanged securely via the POST handler.
  finalRedirectUrl.searchParams.set('code', code);
  return NextResponse.redirect(finalRedirectUrl);
}
