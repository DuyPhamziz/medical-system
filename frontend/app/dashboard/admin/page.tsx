"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { UsersTab } from "./tabs/users-tab";
import { FormsTab } from "./tabs/forms-tab";
import { OrgsTab } from "./tabs/orgs-tab";
import { OverviewTab } from "./tabs/overview-tab";

export default function AdminDashboardPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tab = searchParams.get("tab") || "overview";

	const tabs = [
		{ key: "overview", label: "Tổng quan" },
		{ key: "orgs", label: "Tổ chức" },
		{ key: "users", label: "Người dùng" },
		{ key: "forms", label: "Biểu mẫu" },
		{ key: "config", label: "Cấu hình" },
	];

	const setTab = (newTab: string) => {
		router.push(`/dashboard/admin?tab=${newTab}`);
	};

	return (
		<div className="space-y-6">
			<div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Khu vực quản trị</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">Bảng điều khiển</h1>
				<p className="mt-2 text-slate-600">Quản lý tổ chức, người dùng, biểu mẫu và cấu hình hệ thống.</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 overflow-x-auto">
				{tabs.map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
						className={`flex-1 min-w-[100px] rounded-xl py-2.5 text-sm font-bold transition-all ${
							tab === t.key
								? "bg-white text-cyan-700 shadow-sm"
								: "text-slate-500 hover:text-slate-700"
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{tab === "overview" && <OverviewTab />}
			{tab === "orgs" && <OrgsTab />}
			{tab === "users" && <UsersTab />}
			{tab === "forms" && <FormsTab />}
			{tab === "config" && (
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
					<p className="text-slate-500 font-bold">Cấu hình hệ thống đang được phát triển</p>
				</div>
			)}
		</div>
	);
}
