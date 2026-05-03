"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_DASHBOARD } from "@/config/roles";
import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
	const router = useRouter();
	const {
		hydrate,
		hydrated,
		isAuthenticated,
		role,
		user,
		clearSession,
		setSession,
	} = useAuthStore();

	useEffect(() => {
		if (!hydrated) {
			void hydrate();
		}
	}, [hydrate, hydrated]);

	const redirectAfterLogin = () => {
		if (!role) {
			router.replace("/dashboard");
			return;
		}

		router.replace(ROLE_DASHBOARD[role]);
	};

	return {
		user,
		role,
		isAuthenticated,
		hydrated,
		setSession,
		clearSession,
		redirectAfterLogin,
	};
}
