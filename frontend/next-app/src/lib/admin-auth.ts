interface AdminSessionPayload {
  sub: string; // user identifier
  iat: number; // issued at
  exp: number; // expiry
  jti: string; // unique token ID
  role: string; // admin role
}

function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(data: string): string {
  return atob(data.replace(/-/g, "+").replace(/_/g, "/"));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return toHex(signature);
}

export async function createAdminSessionToken(
  secret: string,
  userId: string = "admin",
  expiresInHours: number = 24,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInHours * 3600;
  const jti = crypto.randomUUID();

  const payload: AdminSessionPayload = {
    sub: userId,
    iat: now,
    exp,
    jti,
    role: "admin",
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSha256(secret, message);

  return `${message}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    // Verify signature
    const message = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await hmacSha256(secret, message);
    if (signature !== expectedSignature) return false;

    // Decode and verify payload
    const payload: AdminSessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Check expiry
    if (payload.exp < now) return false;

    // Verify role
    if (payload.role !== "admin") return false;

    return true;
  } catch {
    return false;
  }
}

export async function decodeAdminSessionToken(
  token: string | undefined,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload: AdminSessionPayload = JSON.parse(base64UrlDecode(parts[1]));
    return payload;
  } catch {
    return null;
  }
}
