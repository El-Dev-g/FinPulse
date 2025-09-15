import { NextResponse } from "next/server";

export async function GET() {
  const scopes = [
    "info",
    "accounts",
    "balance",
    "transactions",
    "offline_access" // needed if you want refresh_token
  ];

  const state = crypto.randomUUID(); // optional: store in session/cookie for CSRF protection

  const url = new URL(`${process.env.TRUELAYER_AUTH_URL}/?response_type=code`);
  url.searchParams.set("client_id", process.env.TRUELAYER_CLIENT_ID!);
  url.searchParams.set("redirect_uri", process.env.TRUELAYER_REDIRECT_URI!);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("providers", "uk-ob-all"); // sandbox provider

  return NextResponse.redirect(url.toString());
}
