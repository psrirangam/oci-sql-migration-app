import { createHmac, timingSafeEqual } from "node:crypto";
import { parse } from "cookie";
import type { Request, Response } from "express";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

export const ADMIN_COOKIE_NAME = "sqlapp_admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

type AdminTokenPayload = {
  sub: string;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getAdminSecret() {
  return ENV.adminSessionSecret || ENV.cookieSecret;
}

function signPayload(encodedPayload: string) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or JWT_SECRET is required for admin sessions");
  }

  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

function createAdminToken(username: string) {
  const payload: AdminTokenPayload = {
    sub: username,
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyAdminToken(token?: string): boolean {
  if (!token) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminTokenPayload;
    return payload.sub === ENV.adminUsername && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(req: Request): boolean {
  const cookies = parse(req.headers.cookie ?? "");

  try {
    return verifyAdminToken(cookies[ADMIN_COOKIE_NAME]);
  } catch {
    return false;
  }
}

export function validateAdminCredentials(username: string, password: string): boolean {
  if (!ENV.adminUsername || !ENV.adminPassword) return false;
  return username === ENV.adminUsername && password === ENV.adminPassword;
}

export function setAdminSessionCookie(req: Request, res: Response) {
  const token = createAdminToken(ENV.adminUsername);
  res.cookie(ADMIN_COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: ADMIN_SESSION_TTL_MS,
  });
}

export function clearAdminSessionCookie(req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    ...getSessionCookieOptions(req),
    maxAge: -1,
  });
}
