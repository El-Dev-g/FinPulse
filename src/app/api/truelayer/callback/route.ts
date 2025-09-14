
// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { saveTruelayerToken } from '@/lib/db';

const exchangeCodeRequestSchema = z.object({
  code: z.string(),
  code_verifier: z.string(),
  redirect_uri: z.string().url(),
});

// This is a new route handler for the client to call from the final redirect page.
// It securely handles the token exchange on the server-side.
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = exchangeCodeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
  }

  const { code, code_verifier, redirect_uri } = parsed.data;

  const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
  const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
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

    // IMPORTANT: Save the token to Firestore
    await saveTruelayerToken({
        access_token: responseData.access_token,
        refresh_token: responseData.refresh_token,
        expires_in: responseData.expires_in,
        token_type: responseData.token_type,
        scope: responseData.scope,
    });
    
    console.log("Successfully exchanged code for token and saved to database.");
    
    // For this prototype, we'll just confirm success. The client will handle showing the account selection.
    return NextResponse.json({ success: true, message: "Token exchanged and saved successfully." });

  } catch (error: any) {
    console.error("Token exchange failed:", error);
    return NextResponse.json({ error: 'An internal server error occurred during token exchange.' }, { status: 500 });
  }
}
