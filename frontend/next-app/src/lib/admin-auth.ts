const sessionPayload = "terraiq-admin-session-v1";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function createAdminSessionToken(secret: string): Promise<string> {
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
    new TextEncoder().encode(sessionPayload),
  );

  return toHex(signature);
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false;

  const expectedToken = await createAdminSessionToken(secret);
  if (token.length !== expectedToken.length) return false;

  let difference = 0;
  for (let index = 0; index < token.length; index += 1) {
    difference |= token.charCodeAt(index) ^ expectedToken.charCodeAt(index);
  }

  return difference === 0;
}
