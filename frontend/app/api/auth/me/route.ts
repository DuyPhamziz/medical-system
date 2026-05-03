import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(env.accessTokenCookieKey)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${env.apiBaseUrl}/auth/me`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json" 
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json({ message: "Failed to fetch user profile" }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Backend service unavailable" },
      { status: 502 },
    );
  }
}
