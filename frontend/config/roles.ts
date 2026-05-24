import { Role } from "@/types/user";

export const ROLE_DASHBOARD: Record<Role, string> = {
	ADMIN: "/dashboard/admin",
	DOCTOR: "/dashboard/doctor",
	PATIENT: "/dashboard/patient",
	STAFF: "/dashboard/queue",
};

export const ROLE_MENU: Record<Role, Array<{ label: string; href: string }>> = {
	ADMIN: [
		{ label: "Tổng quan", href: "/dashboard/admin?tab=overview" },
		{ label: "Tổ chức", href: "/dashboard/admin?tab=orgs" },
		{ label: "Người dùng", href: "/dashboard/admin?tab=users" },
		{ label: "Biểu mẫu", href: "/dashboard/admin?tab=forms" },
		{ label: "Phòng khám", href: "/dashboard/clinics" },
		{ label: "Cấu hình", href: "/dashboard/admin?tab=config" },
	],
	DOCTOR: [
		{ label: "Lịch hẹn", href: "/dashboard/appointments" },
		{ label: "Bệnh nhân", href: "/dashboard/doctor?tab=patients" },
		{ label: "Lượt khám", href: "/dashboard/doctor?tab=visits" },
		{ label: "Chẩn đoán", href: "/dashboard/doctor?tab=diagnosis" },
		{ label: "CDSS", href: "/dashboard/cdss" },
		{ label: "Biểu mẫu", href: "/dashboard/forms" },
	],
	PATIENT: [
		{ label: "Trang chủ", href: "/dashboard/patient" },
		{ label: "Hồ sơ của tôi", href: "/dashboard/patient/profile" },
	],
	STAFF: [
		{ label: "Hàng chờ", href: "/dashboard/queue" },
		{ label: "Bệnh nhân", href: "/dashboard/doctor?tab=patients" },
		{ label: "Phòng khám", href: "/dashboard/clinics" },
	],
};

export const DASHBOARD_ROLE_GUARD: Record<string, Role[]> = {
	"/dashboard/admin": ["ADMIN"],
	"/dashboard/forms": ["DOCTOR"],
	"/dashboard/doctor": ["DOCTOR", "STAFF"],
	"/dashboard/patient": ["PATIENT"],
	"/dashboard/appointments": ["DOCTOR", "STAFF"],
	"/dashboard/clinics": ["ADMIN", "STAFF"],
	"/dashboard/cdss": ["DOCTOR"],
	"/dashboard/queue": ["STAFF", "DOCTOR"],
};
