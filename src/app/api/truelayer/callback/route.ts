// src/app/api/truelayer/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const redirectUrl = new URL('/dashboard/link-account', request.url);

  if (error) {
    // Handle cases where the user denies permission or an error occurs
    redirectUrl.searchParams.set('error', `truelayer_error_${error}`);
    return NextResponse.redirect(redirectUrl);
  }


  if (!code) {
    // Handle cases where the code is missing
    redirectUrl.searchParams.set('error', 'truelayer_missing_code');
    return NextResponse.redirect(redirectUrl);
  }

  // In a real application, you would exchange this code for an access token
  // with the Truelayer API from your backend.
  console.log(`Received Truelayer auth code: ${code}`);
  console.log('Simulating token exchange...');
  // const accessToken = await exchangeCodeForToken(code);
  // await saveTokenToDatabase(userId, accessToken);


  // After successfully getting a token and storing it,
  // redirect the user back to the accounts page with a success message.
  redirectUrl.searchParams.set('success', 'truelayer_connected');
  
  return NextResponse.redirect(redirectUrl);
}
