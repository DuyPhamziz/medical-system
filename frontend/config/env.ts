export const env = {
	apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
	bffBaseUrl: process.env.NEXT_PUBLIC_BFF_BASE_URL ?? "/api/bff",
	accessTokenCookieKey: "med_access_token",
	refreshTokenCookieKey: "med_refresh_token",
	roleCookieKey: "med_role",
};
