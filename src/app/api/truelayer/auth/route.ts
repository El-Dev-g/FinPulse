import { NextResponse } from "next/server";

export async function GET() {
  const query = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TRUELAYER_CLIENT_ID!,
    redirect_uri: process.env.TRUELAYER_REDIRECT_URI!,
    scope: "info accounts balance transactions", // choose your scopes
    providers: "uk-ob-all", // sandbox/test providers
  });

  const url = `${process.env.TRUELAYER_AUTH_URL}/?${query.toString()}`;
  return NextResponse.redirect(url);
}
