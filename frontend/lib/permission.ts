import { Role } from "@/types/user";

export const PERMISSIONS_BY_ROLE: Record<Role, string[]> = {
	ADMIN: [
		"USER_MANAGE",
		"ROLE_ASSIGN",
		"SYSTEM_CONFIG_READ",
		"PATIENT_READ",
		"VISIT_MANAGE",
		"DIAGNOSIS_WRITE",
		"APPOINTMENT_READ_SELF",
		"MEDICAL_RECORD_READ_SELF",
	],
	DOCTOR: ["PATIENT_READ", "VISIT_MANAGE", "DIAGNOSIS_WRITE"],
	STAFF: ["PATIENT_READ", "VISIT_MANAGE"],
	PATIENT: ["APPOINTMENT_READ_SELF", "MEDICAL_RECORD_READ_SELF"],
};

export function roleHasPermission(role: Role | null | undefined, permission: string): boolean {
	if (!role) {
		return false;
	}

	return (PERMISSIONS_BY_ROLE[role] ?? []).includes(permission);
}
