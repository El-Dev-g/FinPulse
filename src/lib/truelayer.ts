export async function refreshTrueLayerToken(refreshToken: string) {
  const res = await fetch(`${process.env.TRUELAYER_AUTH_URL}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.TRUELAYER_CLIENT_ID!,
      client_secret: process.env.TRUELAYER_CLIENT_SECRET!,
      refresh_token: refreshToken
    })
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  return res.json();
}
