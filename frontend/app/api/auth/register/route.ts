import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { AuthResponse } from "@/types/user";
import { sanitizeAuthPayload, setAuthCookies } from "@/app/api/auth/_shared";

async function safeReadJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return { message: "Invalid backend response" };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const backendResponse = await fetch(`${env.apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await safeReadJson(backendResponse)) as AuthResponse | { message?: string };
    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    const response = NextResponse.json(sanitizeAuthPayload(data as AuthResponse));
    setAuthCookies(response, data as AuthResponse);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Backend auth service unavailable" },
      { status: 502 },
    );
  }
}
