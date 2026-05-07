"use client";

import { useEffect, useState } from "react";
import { organizationApi } from "@/services/organization.api";
import { Organization } from "@/types/organization";

export function OrgsTab() {
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const data = await organizationApi.list();
				setOrgs(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, []);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-800">Quản lý tổ chức</h2>
			</div>

			{loading ? (
				<p className="text-sm text-slate-500">Đang tải danh sách tổ chức...</p>
			) : orgs.length === 0 ? (
				<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
					</div>
					<p className="text-lg font-bold text-slate-700">Chưa có tổ chức nào</p>
					<p className="mt-2 text-sm text-slate-500">Tổ chức sẽ được tạo tự động khi có người dùng đăng ký.</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{orgs.map((org) => (
						<div key={org.orgId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-cyan-200 transition-all">
							<div className="flex items-start justify-between">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 font-black text-lg">
									{org.name[0].toUpperCase()}
								</div>
								<span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
									org.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
								}`}>
									{org.isActive ? "Hoạt động" : "Tạm ngưng"}
								</span>
							</div>

							<h3 className="mt-4 text-lg font-bold text-slate-900">{org.name}</h3>
							{org.type && <p className="text-sm text-slate-500">{org.type}</p>}

							<div className="mt-4 flex items-center gap-2">
								<span className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
									{org.subscriptionPlan}
								</span>
							</div>

							<div className="mt-4 space-y-2 text-sm text-slate-600">
								{org.email && (
									<p className="flex items-center gap-2">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
										{org.email}
									</p>
								)}
								{org.phone && (
									<p className="flex items-center gap-2">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
										{org.phone}
									</p>
								)}
							</div>

							<div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
								<p className="text-xs font-bold text-slate-400">
									Tạo: {new Date(org.createdAt).toLocaleDateString("vi-VN")}
								</p>
								<button className="text-xs font-bold text-cyan-600 hover:underline uppercase tracking-wider">
									Chi tiết
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
