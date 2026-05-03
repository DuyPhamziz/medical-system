"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPatientDashboard } from "@/services/patient.api";
import { PatientResponse, PatientFormResponse, VisitResponse, VitalSignsResponse } from "@/types/patient";

export default function PatientDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [patient, setPatient] = useState<PatientResponse | null>(null);
	const [forms, setForms] = useState<PatientFormResponse[]>([]);
	const [visits, setVisits] = useState<VisitResponse[]>([]);
	const [vitals, setVitals] = useState<VitalSignsResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"timeline" | "forms" | "stats" | "admin">("timeline");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const dashboardData = await getPatientDashboard(params.id);
				setPatient(dashboardData.patientInfo);
				setForms(dashboardData.recentForms);
				setVisits(dashboardData.recentVisits);
				setVitals(dashboardData.vitalSignsHistory);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, [params.id]);

	if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Đang tải hồ sơ bệnh nhân...</div>;
	if (!patient) return <div className="p-10 text-center text-rose-600 font-bold">Không tìm thấy thông tin bệnh nhân.</div>;

	return (
		<div className="space-y-6 pb-20">
			{/* TOP NAVIGATION */}
			<div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
				<div className="flex items-center gap-4">
					<button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-50 transition-all">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
					</button>
					<h1 className="text-xl font-black text-slate-900 uppercase">Hồ sơ bệnh án điện tử</h1>
				</div>
				<div className="flex gap-2">
					<Button variant="secondary" className="rounded-2xl">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
						Xuất PDF
					</Button>
					<Button className="rounded-2xl shadow-lg shadow-emerald-100">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
						Ghi chú khám
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[350px_1fr]">
				{/* LEFT COLUMN: STATIC BIO */}
				<div className="space-y-6">
					<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
						<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-600 text-3xl font-black text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
							{patient.fullName[0].toUpperCase()}
						</div>
						<h2 className="mt-6 text-2xl font-black text-slate-900 uppercase leading-tight">{patient.fullName}</h2>
						<p className="mt-1 font-mono text-sm font-bold text-slate-400">PID-{patient.patientId.slice(0, 8).toUpperCase()}</p>
						
						<div className="mt-8 grid grid-cols-2 gap-3 text-left">
							<div className="rounded-2xl bg-slate-50 p-3">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Giới tính</p>
								<p className="text-lg font-black text-slate-700">{patient.gender || "N/A"}</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-3">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</p>
								<p className="text-sm font-black text-emerald-600">{patient.status || "ACTIVE"}</p>
							</div>
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Liên lạc nhanh</h3>
						<div className="mt-4 space-y-4">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số điện thoại</p>
								<p className="text-sm font-bold text-slate-700">{patient.phoneNumber || "N/A"}</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
								<p className="text-sm font-bold text-slate-700">{patient.email || "N/A"}</p>
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bảo hiểm y tế</p>
								<p className="text-sm font-bold text-slate-700">{patient.healthInsuranceNumber || "Chưa cập nhật"}</p>
							</div>
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN: DYNAMIC CONTENT */}
				<div className="space-y-6">
					{/* TABS HEADER */}
					<div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 overflow-x-auto">
						<button 
							onClick={() => setActiveTab("timeline")}
							className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${activeTab === "timeline" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							Lịch sử khám
						</button>
						<button 
							onClick={() => setActiveTab("forms")}
							className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${activeTab === "forms" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							Biểu mẫu y khoa ({forms.length})
						</button>
						<button 
							onClick={() => setActiveTab("stats")}
							className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${activeTab === "stats" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							Chỉ số sinh tồn
						</button>
						<button 
							onClick={() => setActiveTab("admin")}
							className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-sm font-bold transition-all ${activeTab === "admin" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							Hành chính
						</button>
					</div>

					{/* TAB CONTENT: TIMELINE */}
					{activeTab === "timeline" && (
						<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
							<div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
								{visits.length > 0 ? visits.map((v) => (
									<div key={v.visitId} className="relative pl-10">
										<div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-4 ring-white">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
										</div>
										<div>
											<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
												{new Date(v.visitDate).toLocaleString("vi-VN")} - Bác sĩ: {v.doctorName}
											</p>
											<p className="mt-1 font-bold text-slate-900">{v.reasonForVisit}</p>
											<div className="mt-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
												<p><strong>Chẩn đoán:</strong> {v.diagnosis || "Đang cập nhật"}</p>
												<p><strong>Xử trí:</strong> {v.treatmentPlan || "Đang cập nhật"}</p>
											</div>
										</div>
									</div>
								)) : (
									<div className="text-center p-10 text-slate-400 font-bold">Chưa có lịch sử khám bệnh.</div>
								)}
							</div>
						</div>
					)}

					{/* TAB CONTENT: FORMS */}
					{activeTab === "forms" && (
						<div className="grid gap-4 sm:grid-cols-2">
							{forms.length > 0 ? forms.map((f) => (
								<div key={f.sessionId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-200 transition-all group">
									<div className="flex justify-between items-start">
										<div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
										</div>
										<span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${f.status === "SUBMITTED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
											{f.status}
										</span>
									</div>
									<h4 className="mt-4 font-bold text-slate-900 line-clamp-1">{f.formTitle}</h4>
									<div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
										<p className="text-xs font-bold text-slate-400">{new Date(f.startedAt).toLocaleDateString("vi-VN")}</p>
										<button className="text-xs font-black text-emerald-600 hover:underline uppercase tracking-wider">Xem kết quả</button>
									</div>
								</div>
							)) : (
								<div className="col-span-full rounded-3xl border border-dashed border-slate-200 p-12 text-center">
									<p className="font-bold text-slate-400">Bệnh nhân chưa thực hiện biểu mẫu nào.</p>
								</div>
							)}
						</div>
					)}

					{/* TAB CONTENT: STATS */}
					{activeTab === "stats" && (
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-3">
								<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Huyết áp gần nhất</p>
									<p className="mt-2 text-2xl font-black text-slate-900">
										{vitals[0]?.bloodPressureSystolic || "--"}/{vitals[0]?.bloodPressureDiastolic || "--"} <span className="text-sm font-bold text-slate-400">mmHg</span>
									</p>
								</div>
								<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nhịp tim</p>
									<p className="mt-2 text-2xl font-black text-slate-900">
										{vitals[0]?.heartRate || "--"} <span className="text-sm font-bold text-slate-400">bpm</span>
									</p>
								</div>
								<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
									<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">BMI</p>
									<p className="mt-2 text-2xl font-black text-emerald-600">
										{vitals[0]?.bmi?.toFixed(1) || "--"}
									</p>
								</div>
							</div>
							
							<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
								<h3 className="font-bold text-slate-900 uppercase tracking-widest mb-6">Lịch sử chỉ số</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-left">
										<thead>
											<tr className="border-b border-slate-100">
												<th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Ngày ghi</th>
												<th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Huyết áp</th>
												<th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Nhịp tim</th>
												<th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Nhiệt độ</th>
												<th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Cân nặng</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-50">
											{vitals.map((v) => (
												<tr key={v.vitalSignId}>
													<td className="py-4 text-sm font-bold text-slate-700">{new Date(v.recordedAt).toLocaleDateString("vi-VN")}</td>
													<td className="py-4 text-sm text-slate-600">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</td>
													<td className="py-4 text-sm text-slate-600">{v.heartRate}</td>
													<td className="py-4 text-sm text-slate-600">{v.temperature}°C</td>
													<td className="py-4 text-sm text-slate-600">{v.weight}kg</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* TAB CONTENT: ADMINISTRATIVE */}
					{activeTab === "admin" && (
						<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
							<div className="grid gap-8 md:grid-cols-2">
								<section>
									<h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Thông tin cơ bản</h4>
									<div className="space-y-4">
										<div>
											<p className="text-[10px] font-bold uppercase text-slate-400">Họ và tên</p>
											<p className="text-sm font-bold text-slate-700">{patient.fullName}</p>
										</div>
										<div>
											<p className="text-[10px] font-bold uppercase text-slate-400">Ngày sinh</p>
											<p className="text-sm font-bold text-slate-700">{patient.dateOfBirth || "N/A"}</p>
										</div>
										<div>
											<p className="text-[10px] font-bold uppercase text-slate-400">Số định danh (CCCD/CMND)</p>
											<p className="text-sm font-bold text-slate-700">{patient.nationalId || "Chưa cập nhật"}</p>
										</div>
										<div>
											<p className="text-[10px] font-bold uppercase text-slate-400">Nghề nghiệp</p>
											<p className="text-sm font-bold text-slate-700">{patient.occupation || "Chưa cập nhật"}</p>
										</div>
									</div>
								</section>
								<section>
									<h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Liên hệ khẩn cấp</h4>
									<div className="space-y-4">
										<div>
											<p className="text-[10px] font-bold uppercase text-slate-400">Người liên hệ</p>
											<p className="text-sm font-bold text-slate-700">{patient.emergencyContactName || "N/A"}</p>
										</div>
										<div>
											<p className="text-[10px] font-bold uppercase text-slate-400">Số điện thoại khẩn cấp</p>
											<p className="text-sm font-bold text-slate-700">{patient.emergencyContactPhone || "N/A"}</p>
										</div>
									</div>
								</section>
							</div>
							<div className="mt-10 pt-6 border-t border-slate-100">
								<Button variant="outline" className="rounded-2xl border-slate-200">
									Chỉnh sửa thông tin hành chính
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
