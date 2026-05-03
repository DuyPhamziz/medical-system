import { Role } from "@/types/user";

type JwtPayload = {
	sub: string;
	email: string;
	role: Role;
	exp: number;
	iat: number;
	type?: "access" | "refresh";
};

function decodeBase64Url(input: string): string {
	const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

	if (typeof window === "undefined") {
		return Buffer.from(padded, "base64").toString("utf8");
	}

	return decodeURIComponent(
		atob(padded)
			.split("")
			.map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
			.join(""),
	);
}

export function parseJwt(token?: string | null): JwtPayload | null {
	if (!token) {
		return null;
	}

	try {
		const [, payload] = token.split(".");
		if (!payload) {
			return null;
		}
		return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
	} catch {
		return null;
	}
}

export function isTokenExpired(token?: string | null): boolean {
	const payload = parseJwt(token);
	if (!payload?.exp) {
		return true;
	}
	return Date.now() >= payload.exp * 1000;
}

export function getRoleFromToken(token?: string | null): Role | null {
	const payload = parseJwt(token);
	return payload?.role ?? null;
}
