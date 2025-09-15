import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    // Redirect with an error if the code is missing
    const redirectUrl = new URL('/dashboard/link-account', req.nextUrl.origin);
    redirectUrl.searchParams.set('error', 'Authorization code missing');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange the code for a token
    const response = await fetch(`${process.env.TRUELAYER_AUTH_URL}/connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.TRUELAYER_CLIENT_ID!,
        client_secret: process.env.TRUELAYER_CLIENT_SECRET!,
        redirect_uri: process.env.TRUELAYER_REDIRECT_URI!,
        code,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        // If the response is not OK, throw an error with the details from Truelayer
        throw new Error(data.error_description || data.error || 'Token exchange failed');
    }

    console.log("Token response:", data);
    // In a real app, you would save the access_token and refresh_token to your database here.

    // Redirect to the account linking page with a success flag
    const redirectUrl = new URL('/dashboard/link-account', req.nextUrl.origin);
    redirectUrl.searchParams.set('success', 'true');
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error("Truelayer callback error:", error);
    // Redirect with an error message if something goes wrong
    const redirectUrl = new URL('/dashboard/link-account', req.nextUrl.origin);
    redirectUrl.searchParams.set('error', error.message || 'An unknown error occurred');
    return NextResponse.redirect(redirectUrl);
  }
}
