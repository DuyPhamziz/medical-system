"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPatients } from "@/services/patient.api";
import { PatientResponse } from "@/types/patient";

export default function PatientListPage() {
	const [patients, setPatients] = useState<PatientResponse[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const data = await listPatients();
				setPatients(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, []);

	const filteredPatients = patients.filter((p) =>
		p.fullName.toLowerCase().includes(search.toLowerCase()) ||
		(p.email && p.email.toLowerCase().includes(search.toLowerCase()))
	);

	return (
		<div className="space-y-6">
			{/* HEADER & STATS */}
			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2 flex flex-col justify-center rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
					<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Patient Hub</p>
					<h1 className="mt-2 text-4xl font-black text-slate-900 leading-tight">Quản lý hồ sơ bệnh nhân</h1>
					<p className="mt-2 text-slate-500 font-medium">Tìm kiếm, theo dõi và quản lý dữ liệu lâm sàng của bệnh nhân tập trung.</p>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
						<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng số</p>
						<p className="mt-2 text-3xl font-black">{patients.length}</p>
					</div>
					<div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-xl shadow-emerald-100">
						<p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Mới hôm nay</p>
						<p className="mt-2 text-3xl font-black">0</p>
					</div>
				</div>
			</div>

			{/* SEARCH & FILTERS */}
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
				<div className="relative flex-1 min-w-[300px]">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
					</div>
					<input
						placeholder="Tìm tên bệnh nhân, mã số, số điện thoại..."
						className="w-full rounded-2xl border-none bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none ring-emerald-500/20 transition-all focus:bg-white focus:ring-4"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="flex gap-2">
					<Button variant="secondary" className="rounded-2xl px-6">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/></svg>
						Lọc nâng cao
					</Button>
					<Button className="rounded-2xl px-6 shadow-lg shadow-emerald-100">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
						Thêm bệnh nhân
					</Button>
				</div>
			</div>

			{/* PATIENT TABLE */}
			<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr className="border-b border-slate-100 bg-slate-50/50">
							<th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã BN</th>
							<th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và Tên</th>
							<th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Liên hệ</th>
							<th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày tạo</th>
							<th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-50">
						{loading ? (
							<tr>
								<td colSpan={5} className="p-12 text-center text-slate-400 font-bold">Đang tải dữ liệu...</td>
							</tr>
						) : filteredPatients.length > 0 ? (
							filteredPatients.map((p) => (
								<tr key={p.patientId} className="group hover:bg-emerald-50/30 transition-colors">
									<td className="px-6 py-4">
										<span className="font-mono text-xs font-bold text-slate-400">BN-{p.patientId.slice(0, 8).toUpperCase()}</span>
									</td>
									<td className="px-6 py-4">
										<Link href={`/dashboard/patients/${p.patientId}`} className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
												{p.fullName[0].toUpperCase()}
											</div>
											<p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase">{p.fullName}</p>
										</Link>
									</td>
									<td className="px-6 py-4">
										<p className="text-sm font-semibold text-slate-600">{p.email || "Chưa có email"}</p>
									</td>
									<td className="px-6 py-4">
										<p className="text-sm font-medium text-slate-500">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</p>
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex justify-end gap-2">
											<button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all">
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
											</button>
											<Link href={`/dashboard/patients/${p.patientId}`}>
												<button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all border border-transparent hover:border-emerald-100">
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
												</button>
											</Link>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={5} className="p-12 text-center text-slate-400 font-bold">Không tìm thấy bệnh nhân nào.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
