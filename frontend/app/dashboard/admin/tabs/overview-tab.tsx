"use client";

import { useEffect, useState } from "react";
import { organizationApi } from "@/services/organization.api";
import { Organization, SUBSCRIPTION_PLANS } from "@/types/organization";

export function OverviewTab() {
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				setOrgs(await organizationApi.list());
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, []);

	const activeOrgs = orgs.filter((o) => o.isActive);
	const totalOrgs = orgs.length;

	return (
		<div className="space-y-6">
			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-4">
				<div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
					<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng tổ chức</p>
					<p className="mt-2 text-3xl font-black">{loading ? "..." : totalOrgs}</p>
				</div>
				<div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-xl">
					<p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Đang hoạt động</p>
					<p className="mt-2 text-3xl font-black">{loading ? "..." : activeOrgs.length}</p>
				</div>
				<div className="rounded-2xl bg-cyan-600 p-6 text-white shadow-xl">
					<p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Gói trả phí</p>
					<p className="mt-2 text-3xl font-black">
						{loading ? "..." : orgs.filter((o) => o.subscriptionPlan !== "FREE").length}
					</p>
				</div>
				<div className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl border border-slate-200">
					<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Doanh thu</p>
					<p className="mt-2 text-3xl font-black">Đang tính...</p>
				</div>
			</div>

			{/* Plans */}
			<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
				<h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Gói dịch vụ</h3>
				<div className="grid gap-4 md:grid-cols-4">
					{SUBSCRIPTION_PLANS.map((plan) => (
						<div key={plan.value} className="rounded-2xl border border-slate-100 p-6 hover:border-cyan-100 transition-all">
							<p className="text-sm font-bold text-slate-900">{plan.label}</p>
							<p className="mt-1 text-2xl font-black text-slate-900">
								{plan.price > 0 ? `${(plan.price / 1000).toFixed(0)}k` : "Liên hệ"}
							</p>
							<ul className="mt-4 space-y-2">
								{plan.features.map((f) => (
									<li key={f} className="flex items-center gap-2 text-xs text-slate-600">
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
										{f}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
