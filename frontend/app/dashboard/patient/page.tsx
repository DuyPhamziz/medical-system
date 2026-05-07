"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { appointmentApi } from "@/services/appointment.api";
import { visitApi } from "@/services/visit.api";
import { getMyPatientProfile } from "@/services/patient.api";
import { Appointment } from "@/types/appointment";
import { VisitResponse } from "@/types/patient";

export default function PatientDashboardPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [visits, setVisits] = useState<VisitResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [patientId, setPatientId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"appointments" | "records">("appointments");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
			// Get patient profile via /me endpoint
				const profile = await getMyPatientProfile().catch(() => null);

				if (profile) {
					setPatientId(profile.patientId);
					const [apps, v] = await Promise.all([
						appointmentApi.getPatientAppointments(profile.patientId),
						visitApi.getPatientVisits(profile.patientId),
					]);
					setAppointments(apps);
					setVisits(v);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, [user]);

	const upcomingAppointments = appointments.filter((a) => a.status === "SCHEDULED" || a.status === "CONFIRMED");
	const pastAppointments = appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED");

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-indigo-700">Cổng bệnh nhân</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">
					Xin chào, {user?.username || "Bệnh nhân"}
				</h1>
				<p className="mt-2 text-slate-600">Quản lý lịch hẹn, hồ sơ sức khỏe và thanh toán.</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
				<button
					onClick={() => setActiveTab("appointments")}
					className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
						activeTab === "appointments" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
					}`}
				>
					Lịch hẹn
				</button>
				<button
					onClick={() => setActiveTab("records")}
					className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
						activeTab === "records" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
					}`}
				>
					Hồ sơ y tế
				</button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center p-12">
					<p className="text-slate-400 font-bold animate-pulse">Đang tải dữ liệu...</p>
				</div>
			) : !patientId ? (
				<div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
					</div>
					<p className="text-lg font-bold text-slate-700">Chưa có hồ sơ bệnh nhân</p>
					<p className="mt-2 text-sm text-slate-500">Vui lòng liên hệ phòng khám để được tạo hồ sơ.</p>
				</div>
			) : (
				<>
					{/* === APPOINTMENTS TAB === */}
					{activeTab === "appointments" && (
						<div className="space-y-4">
							{/* Summary cards */}
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg">
									<p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Lịch hẹn sắp tới</p>
									<p className="mt-2 text-3xl font-black">{upcomingAppointments.length}</p>
								</div>
								<div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lịch sử khám</p>
									<p className="mt-2 text-3xl font-black text-slate-900">{visits.length}</p>
								</div>
							</div>

							{/* Upcoming */}
							{upcomingAppointments.length > 0 && (
								<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
									<h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Lịch hẹn sắp tới</h3>
									<div className="space-y-3">
										{upcomingAppointments.slice(0, 3).map((app) => (
											<div key={app.appointmentId} className="flex items-center gap-4 rounded-2xl bg-indigo-50/50 p-4">
												<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm">
													{new Date(app.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
												</div>
												<div className="flex-1">
													<p className="font-bold text-slate-900">BS. {app.doctorName || "Đang cập nhật"}</p>
													<p className="text-sm text-slate-500">
														{new Date(app.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
														{" - "}
														{app.reason || "Khám tổng quát"}
													</p>
												</div>
												<span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">
													{app.status === "SCHEDULED" ? "Chờ khám" : "Đã xác nhận"}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{upcomingAppointments.length === 0 && (
								<div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
									<p className="font-bold text-slate-400">Bạn chưa có lịch hẹn nào.</p>
									<p className="mt-2 text-sm text-slate-400">Liên hệ phòng khám để đặt lịch khám.</p>
								</div>
							)}
						</div>
					)}

					{/* === MEDICAL RECORDS TAB === */}
					{activeTab === "records" && (
						<div className="space-y-4">
							{/* Quick links */}
							<div className="grid gap-3 md:grid-cols-3">
								<button
									onClick={() => router.push(`/forms/public`)}
									className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-indigo-200 transition-all"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
									</div>
									<p className="mt-3 font-bold text-slate-900">Biểu mẫu sức khỏe</p>
									<p className="mt-1 text-xs text-slate-500">Điền thông tin sức khỏe định kỳ</p>
								</button>
								<button className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-indigo-200 transition-all">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
									</div>
									<p className="mt-3 font-bold text-slate-900">Đơn thuốc</p>
									<p className="mt-1 text-xs text-slate-500">Xem lịch sử đơn thuốc</p>
								</button>
								<button className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-indigo-200 transition-all">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
									</div>
									<p className="mt-3 font-bold text-slate-900">Hóa đơn</p>
									<p className="mt-1 text-xs text-slate-500">Lịch sử thanh toán</p>
								</button>
							</div>

							{/* Visit History */}
							<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
								<h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Lịch sử khám bệnh</h3>
								{visits.length === 0 ? (
									<p className="text-center py-8 text-slate-400 font-bold">Chưa có lượt khám nào.</p>
								) : (
									<div className="space-y-3">
										{visits.map((v) => (
											<div key={v.visitId} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 font-bold text-xs">
													{new Date(v.visitDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-bold text-slate-900">BS. {v.doctorName}</p>
													<p className="text-sm text-slate-600 truncate">{v.diagnosis || v.reasonForVisit || "Khám tổng quát"}</p>
												</div>
												<span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${
													v.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
													v.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
												}`}>{v.status}</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
