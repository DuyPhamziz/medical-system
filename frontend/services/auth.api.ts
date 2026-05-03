import { AuthResponse, Role, SessionResponse, UserProfile } from "@/types/user";

export type LoginPayload = {
	email: string;
	password: string;
};

export type RegisterPayload = {
	username: string;
	email: string;
	password: string;
	role?: Role;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error("Login failed");
	}

	return (await response.json()) as AuthResponse;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
	const response = await fetch("/api/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error("Register failed");
	}

	return (await response.json()) as AuthResponse;
}

export async function refreshToken(): Promise<AuthResponse> {
	const response = await fetch("/api/auth/refresh", {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Refresh failed");
	}

	return (await response.json()) as AuthResponse;
}

export async function logout(): Promise<void> {
	await fetch("/api/auth/logout", {
		method: "POST",
		credentials: "include",
	});
}

export async function getSession(): Promise<SessionResponse> {
	const response = await fetch("/api/auth/session", {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		return { authenticated: false };
	}

	return (await response.json()) as SessionResponse;
}

export async function getMe(): Promise<UserProfile> {
	const response = await fetch("/api/auth/me", {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch profile");
	}

	return (await response.json()) as UserProfile;
}
