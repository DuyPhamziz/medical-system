import { Role } from "@/types/user";

export const ROLE_DASHBOARD: Record<Role, string> = {
	ADMIN: "/dashboard/admin",
	DOCTOR: "/dashboard/doctor",
	PATIENT: "/dashboard/patient",
	STAFF: "/dashboard/doctor",
};

export const ROLE_MENU: Record<Role, Array<{ label: string; href: string }>> = {
	ADMIN: [
		{ label: "Tổng quan biểu mẫu", href: "/dashboard/admin?tab=forms" },
		{ label: "Quản lý người dùng", href: "/dashboard/admin" },
		{ label: "Cấu hình hệ thống", href: "/dashboard/admin?tab=config" },
	],
	DOCTOR: [
		{ label: "Biểu mẫu", href: "/dashboard/forms" },
		{ label: "Bệnh nhân", href: "/dashboard/doctor?tab=patients" },
		{ label: "Lượt khám", href: "/dashboard/doctor?tab=visits" },
		{ label: "Chẩn đoán", href: "/dashboard/doctor?tab=diagnosis" },
	],
	PATIENT: [
		{ label: "Lịch hẹn", href: "/dashboard/patient?tab=appointments" },
		{ label: "Hồ sơ y tế", href: "/dashboard/patient?tab=records" },
	],
	STAFF: [
		{ label: "Hàng chờ", href: "/dashboard/doctor?tab=queue" },
		{ label: "Biểu mẫu intake", href: "/dashboard/doctor?tab=intake" },
	],
};

export const DASHBOARD_ROLE_GUARD: Record<string, Role[]> = {
	"/dashboard/admin": ["ADMIN"],
	"/dashboard/forms": ["DOCTOR"],
	"/dashboard/doctor": ["DOCTOR", "STAFF"],
	"/dashboard/patient": ["PATIENT"],
};
