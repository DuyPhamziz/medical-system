import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/app/api/auth/_shared";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
