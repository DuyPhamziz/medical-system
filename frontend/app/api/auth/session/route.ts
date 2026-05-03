import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { PERMISSIONS_BY_ROLE } from "@/lib/permission";
import { Role } from "@/types/user";

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

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(env.accessTokenCookieKey)?.value;
  const roleCookie = request.cookies.get(env.roleCookieKey)?.value;
  const payload = decodePayload(accessToken);

  if (!payload || Date.now() >= payload.exp * 1000) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const resolvedRole = (roleCookie as Role | undefined) ?? payload.role;

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: payload.sub,
      email: payload.email,
      username: payload.email,
      role: resolvedRole,
      permissions: PERMISSIONS_BY_ROLE[resolvedRole] ?? [],
      createdAt: "",
    },
  });
}
