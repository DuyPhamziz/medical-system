"use client";

import { roleHasPermission } from "@/lib/permission";
import { useRole } from "@/hooks/useRole";

export function usePermission() {
	const { role } = useRole();

	const can = (permission: string): boolean => {
		return roleHasPermission(role, permission);
	};

	return {
		can,
	};
}
