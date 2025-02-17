export async function base64UrlEncode(str: string) {
  const uint8Array = new TextEncoder().encode(str);
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function base64UrlDecode(str: string) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(str);
  const uint8Array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(uint8Array);
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array) {
  const binary = String.fromCharCode(...uint8Array);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signHS256(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return uint8ArrayToBase64Url(new Uint8Array(signature));
}

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export async function createJWT(header: JWTHeader, payload: JWTPayload, secret: string) {
  const headerEncoded = await base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = await base64UrlEncode(JSON.stringify(payload));
  
  const signature = await signHS256(`${headerEncoded}.${payloadEncoded}`, secret);
  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) throw new Error("Invalid Token Format");

  const message = `${headerB64}.${payloadB64}`;
  const expectedSignature = await signHS256(message, secret);

  if (signatureB64 === expectedSignature) {
    return JSON.parse(await base64UrlDecode(payloadB64));
  } else {
    throw new Error("Invalid Token");
  }
}
  