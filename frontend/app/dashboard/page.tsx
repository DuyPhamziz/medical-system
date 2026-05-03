"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_DASHBOARD } from "@/config/roles";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
	const router = useRouter();
	const { role, hydrated } = useAuth();

	useEffect(() => {
		if (!hydrated) {
			return;
		}

		if (!role) {
			router.replace("/login");
			return;
		}

		router.replace(ROLE_DASHBOARD[role]);
	}, [hydrated, role, router]);

	return <div className="text-slate-500">Đang chuyển hướng tới không gian làm việc của bạn...</div>;
}
