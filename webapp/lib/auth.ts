import { cookies } from "next/headers";

const COOKIE_NAME = "htech_admin";

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  // Token is just the password itself; the cookie is httpOnly so it never
  // leaves the server in client JS. For a single-event tool this is enough.
  return pw;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return mismatch === 0;
}

export function setAdminCookie() {
  const expected = expectedToken();
  if (!expected) throw new Error("ADMIN_PASSWORD not configured");
  cookies().set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export function isAdmin(): boolean {
  const expected = expectedToken();
  if (!expected) return false;
  const c = cookies().get(COOKIE_NAME);
  if (!c) return false;
  return c.value === expected;
}
