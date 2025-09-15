import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin"; // adjust your Firebase admin import
import { getAuth } from 'firebase-admin/auth';
import { app as adminApp } from '@/lib/firebase-admin';

// This is a placeholder for getting the current user's session from the request.
// In a real app, you would use a library like `next-auth` or handle sessions manually.
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // For this prototype, we'll assume no real session management and return a placeholder UID.
  // In a production app, you would verify a session cookie or auth token.
  // IMPORTANT: This is not secure for a real application.
  
  // A more robust approach might involve getting the token and verifying it:
  // const sessionCookie = req.cookies.get('session')?.value;
  // if (!sessionCookie) return null;
  // try {
  //   const decodedIdToken = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
  //   return decodedIdToken.uid;
  // } catch (error) {
  //   console.error('Error verifying session cookie:', error);
  //   return null;
  // }

  // Since we don't have a full session management system, we'll return null and handle it.
  return null;
}


export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const userId = await getUserIdFromRequest(req); // In a real app, this should be the logged-in user's ID.

  const redirectUrl = new URL('/dashboard/link-account', req.nextUrl.origin);


  if (error) {
    redirectUrl.searchParams.set('error', error);
    return NextResponse.redirect(redirectUrl);
  }
  if (!code) {
    redirectUrl.searchParams.set('error', 'Missing authorization code');
    return NextResponse.redirect(redirectUrl);
  }

  // In a real app, we must have a user to associate the token with.
  // We'll simulate this by redirecting with an error if no user is found.
  // In a production environment, your session management would provide the UID.
  if (!userId) {
    // For this prototype, we will proceed without a UID but in production, you must have one.
    console.warn("No user ID found in request. In a real app, this would be an error.");
    // redirectUrl.searchParams.set('error', 'User session not found. Please sign in again.');
    // return NextResponse.redirect(redirectUrl);
  }

  // Exchange code for token
  const tokenRes = await fetch(`${process.env.TRUELAYER_AUTH_URL}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.TRUELAYER_CLIENT_ID!,
      client_secret: process.env.TRUELAYER_CLIENT_SECRET!,
      redirect_uri: process.env.TRUELAYER_REDIRECT_URI!,
      code
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error("Token exchange failed:", tokenData);
    redirectUrl.searchParams.set('error', `Token exchange failed: ${tokenData.error_description || tokenData.error}`);
    return NextResponse.redirect(redirectUrl);
  }

  // In a real app with a UID, we would save to Firestore like this:
  if (userId) {
    await adminDb.collection("users").doc(userId).collection("integrations").doc("truelayer").set({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      created_at: new Date()
    }, { merge: true });
  } else {
    // For prototype purposes without a logged-in user session on the server, we can't save to Firestore securely.
    // The link-account page will handle this via localStorage for now.
    console.log("Mock Firestore save:", {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
    });
  }

  redirectUrl.searchParams.set('success', 'true');
  return NextResponse.redirect(redirectUrl);
}