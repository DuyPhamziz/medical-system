import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { AuthResponse } from "@/types/user";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(response: NextResponse, payload: AuthResponse) {
  const maxAge = Math.max(1, Math.floor((payload.expiresIn ?? 900000) / 1000));

  response.cookies.set(env.accessTokenCookieKey, payload.accessToken ?? "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  response.cookies.set(env.refreshTokenCookieKey, payload.refreshToken ?? "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set(env.roleCookieKey, payload.user.role, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(env.accessTokenCookieKey, "", { path: "/", maxAge: 0 });
  response.cookies.set(env.refreshTokenCookieKey, "", { path: "/", maxAge: 0 });
  response.cookies.set(env.roleCookieKey, "", { path: "/", maxAge: 0 });
}

export function sanitizeAuthPayload(payload: AuthResponse) {
  return {
    user: payload.user,
    expiresIn: payload.expiresIn,
    tokenType: payload.tokenType,
  };
}
