import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { isTokenExpired } from "@/lib/jwt";
import { AuthResponse } from "@/types/user";
import { setAuthCookies } from "@/app/api/auth/_shared";

async function refreshAccessToken(refreshToken: string): Promise<AuthResponse | null> {
  try {
    const refreshResponse = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    return (await refreshResponse.json()) as AuthResponse;
  } catch {
    return null;
  }
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const accessToken = request.cookies.get(env.accessTokenCookieKey)?.value;
  const refreshToken = request.cookies.get(env.refreshTokenCookieKey)?.value;
  const targetPath = pathSegments.join("/");
  const targetUrl = `${env.apiBaseUrl}/${targetPath}${request.nextUrl.search}`;

  const bodyText = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  const send = async (token?: string) => {
    const headers = new Headers(request.headers);
    headers.delete("host");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("authorization");
    }

    return fetch(targetUrl, {
      method: request.method,
      headers,
      body: bodyText,
    });
  };

  let rotatedTokens: AuthResponse | null = null;
  let effectiveAccessToken = accessToken;
  if ((!effectiveAccessToken || isTokenExpired(effectiveAccessToken)) && refreshToken) {
    const refreshedTokens = await refreshAccessToken(refreshToken);
    if (refreshedTokens?.accessToken) {
      effectiveAccessToken = refreshedTokens.accessToken;
      rotatedTokens = refreshedTokens;
    }
  }

  let backendResponse: Response;

  try {
    console.log(`BFF Proxy: ${request.method} ${request.nextUrl.pathname} -> ${targetUrl}`);
    backendResponse = await send(effectiveAccessToken);
    console.log(`BFF Proxy: Backend responded with ${backendResponse.status}`);
  } catch (err) {
    console.error(`BFF Proxy Error:`, err);
    return NextResponse.json(
      { message: "Backend service unavailable" },
      { status: 502 },
    );
  }

  // Only attempt token refresh on 401 if we haven't already rotated tokens
  if (backendResponse.status === 401 && refreshToken && !rotatedTokens) {
    rotatedTokens = await refreshAccessToken(refreshToken);
    if (rotatedTokens?.accessToken) {
      backendResponse = await send(rotatedTokens.accessToken);
    }
  }

  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  const buffer = await backendResponse.arrayBuffer();
  const response = new NextResponse(buffer, {
    status: backendResponse.status,
    headers: responseHeaders,
  });

  if (rotatedTokens) {
    setAuthCookies(response, rotatedTokens);
  }

  return response;
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(request, path);
}
