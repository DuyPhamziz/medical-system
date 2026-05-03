export type Role = "ADMIN" | "DOCTOR" | "PATIENT" | "STAFF";

export type UserProfile = {
	userId: string;
	username: string;
	email: string;
	role: Role;
	permissions: string[];
	createdAt: string;
	fullName?: string;
	phoneNumber?: string;
	address?: string;
	dateOfBirth?: string;
	gender?: string;
};

export type AuthResponse = {
	accessToken?: string;
	refreshToken?: string;
	tokenType?: string;
	expiresIn: number;
	user: UserProfile;
};

export type SessionResponse = {
	authenticated: boolean;
	user?: UserProfile;
};
