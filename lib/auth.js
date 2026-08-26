import crypto from "crypto";

export const SESSION_COOKIE = "icmhs_registrar_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  return secret;
}

// Derives a signed session token from the registrar password + a server-only
// secret. The password itself is never stored in the cookie.
export function makeSessionToken(password) {
  return crypto.createHmac("sha256", getSecret()).update(password).digest("hex");
}

export function isCorrectPassword(candidate) {
  const real = process.env.REGISTRAR_PASSWORD || "";
  if (!real || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isValidSessionCookie(cookieValue) {
  if (!cookieValue) return false;
  const expected = makeSessionToken(process.env.REGISTRAR_PASSWORD || "");
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
