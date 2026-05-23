import { NextRequest, NextResponse } from "next/server";
import { AUTH_REQUIRED_PREFIXES, PUBLIC_ROUTES } from "@/config/routes";
import { DASHBOARD_ROLE_GUARD } from "@/config/roles";
import { env } from "@/config/env";
import { Role } from "@/types/user";

function decodeJwtPayload(token: string): { exp?: number; role?: string } | null {
	try {
		const payload = token.split(".")[1];
		if (!payload) {
			return null;
		}

		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
		return JSON.parse(atob(padded));
	} catch {
		return null;
	}
}

function isExpired(token?: string): boolean {
	if (!token) {
		return true;
	}

	const payload = decodeJwtPayload(token);
	if (!payload?.exp) {
		return true;
	}

	return Date.now() >= payload.exp * 1000;
}

function isProtectedPath(pathname: string): boolean {
	return AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function resolveAllowedRoles(pathname: string): Role[] | null {
	// Form builder - only DOCTOR
	if (pathname.startsWith("/dashboard/forms")) {
		return ["DOCTOR"];
	}

	if (pathname.startsWith("/dashboard/clinics")) {
		return DASHBOARD_ROLE_GUARD["/dashboard/clinics"];
	}

	if (pathname.startsWith("/dashboard/cdss")) {
		return DASHBOARD_ROLE_GUARD["/dashboard/cdss"];
	}

	if (pathname.startsWith("/dashboard/queue")) {
		return DASHBOARD_ROLE_GUARD["/dashboard/queue"];
	}

	if (pathname.startsWith("/dashboard/appointments")) {
		return ["DOCTOR", "STAFF"];
	}

	if (pathname.startsWith("/dashboard/admin")) {
		return DASHBOARD_ROLE_GUARD["/dashboard/admin"];
	}

	if (pathname.startsWith("/dashboard/doctor")) {
		return DASHBOARD_ROLE_GUARD["/dashboard/doctor"];
	}

	if (pathname.startsWith("/dashboard/patient")) {
		return DASHBOARD_ROLE_GUARD["/dashboard/patient"];
	}

	return null;
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const accessToken = request.cookies.get(env.accessTokenCookieKey)?.value;
	const refreshToken = request.cookies.get(env.refreshTokenCookieKey)?.value;
	const role = request.cookies.get(env.roleCookieKey)?.value as Role | undefined;
	const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);

	// If it's a protected path
	if (isProtectedPath(pathname)) {
		// Only redirect to login if BOTH tokens are missing or expired
		const accessExpired = isExpired(accessToken);
		const refreshExpired = isExpired(refreshToken);

		if (accessExpired && refreshExpired) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	// If logged in and trying to access public auth pages
	if (accessToken && !isExpired(accessToken) && isPublic) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// ⚠️ Form builder is DOCTOR or ADMIN only
	if (pathname.startsWith("/dashboard/forms") && role !== "DOCTOR" && role !== "ADMIN") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	const allowedRoles = resolveAllowedRoles(pathname);
	if (allowedRoles && (!role || !allowedRoles.includes(role))) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/login", "/register", "/dashboard/:path*", "/forms/:path*"],
};
