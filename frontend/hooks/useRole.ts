"use client";

import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/types/user";

export function useRole() {
	const role = useAuthStore((state) => state.role);

	const hasRole = (allowed: Role[]) => {
		if (!role) {
			return false;
		}

		return allowed.includes(role);
	};

	return {
		role,
		hasRole,
	};
}
