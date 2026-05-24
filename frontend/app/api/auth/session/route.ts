import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { PERMISSIONS_BY_ROLE } from "@/lib/permission";
import { Role } from "@/types/user";
import { AuthResponse } from "@/types/user";
import { setAuthCookies } from "@/app/api/auth/_shared";

type SessionPayload = {
  sub: string;
  email: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT" | "STAFF";
  exp: number;
};

function decodePayload(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthResponse;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(env.accessTokenCookieKey)?.value;
  const refreshToken = request.cookies.get(env.refreshTokenCookieKey)?.value;
  const roleCookie = request.cookies.get(env.roleCookieKey)?.value;
  let effectiveAccessToken = accessToken;
  let rotatedTokens: AuthResponse | null = null;

  const payload = decodePayload(effectiveAccessToken);

  if ((!payload || Date.now() >= payload.exp * 1000) && refreshToken) {
    rotatedTokens = await refreshAccessToken(refreshToken);
    effectiveAccessToken = rotatedTokens?.accessToken ?? effectiveAccessToken;
  }

  const effectivePayload = decodePayload(effectiveAccessToken);

  if (!effectivePayload || Date.now() >= effectivePayload.exp * 1000) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const resolvedRole = (roleCookie as Role | undefined) ?? effectivePayload.role;

  const meResponse = await fetch(`${env.apiBaseUrl}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${effectiveAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (meResponse.ok) {
    const user = await meResponse.json();
    const response = NextResponse.json({
      authenticated: true,
      user,
    });
    if (rotatedTokens) {
      setAuthCookies(response, rotatedTokens);
    }
    return response;
  }

  const response = NextResponse.json({
    authenticated: true,
    user: {
      userId: effectivePayload.sub,
      email: effectivePayload.email,
      username: effectivePayload.email,
      role: resolvedRole,
      permissions: PERMISSIONS_BY_ROLE[resolvedRole] ?? [],
      createdAt: "",
    },
  });
  if (rotatedTokens) {
    setAuthCookies(response, rotatedTokens);
  }
  return response;
}
