import { cookies } from "next/headers";
import { env } from "@/config/env";
import { UserProfile } from "@/types/user";

export async function getServerProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.accessTokenCookieKey)?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${env.apiBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 }, // Cache dữ liệu trong 60 giây
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
