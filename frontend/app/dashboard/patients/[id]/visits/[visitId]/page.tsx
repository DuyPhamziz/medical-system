"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { visitApi } from "@/services/visit.api";
import { getPatient } from "@/services/patient.api";
import { VisitResponse } from "@/types/patient";

export default function VisitDetailPage() {
	const params = useParams<{ patientId: string; visitId: string }>();
	const router = useRouter();
	const [visit, setVisit] = useState<VisitResponse | null>(null);
	const [patientName, setPatientName] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		diagnosis: "",
		treatmentPlan: "",
		notes: "",
		reasonForVisit: "",
	});

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const [visitData, patientData] = await Promise.all([
					visitApi.getVisit(params.visitId),
					getPatient(params.patientId),
				]);
				setVisit(visitData);
				setPatientName(patientData.fullName);
				setForm({
					diagnosis: visitData.diagnosis || "",
					treatmentPlan: visitData.treatmentPlan || "",
					notes: visitData.notes || "",
					reasonForVisit: visitData.reasonForVisit || "",
				});
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, [params.patientId, params.visitId]);

	const handleSave = async () => {
		setSaving(true);
		try {
			const updated = await visitApi.updateVisit(params.visitId, form);
			setVisit(updated);
		} catch (err) {
			console.error(err);
		} finally {
			setSaving(false);
		}
	};

	const handleComplete = async () => {
		await handleSave();
		await visitApi.updateVisitStatus(params.visitId, "COMPLETED");
		router.push(`/dashboard/patients/${params.patientId}`);
	};

	if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Đang tải phiếu khám...</div>;
	if (!visit) return <div className="p-10 text-center text-rose-600 font-bold">Không tìm thấy phiếu khám.</div>;

	return (
		<div className="mx-auto max-w-4xl space-y-6 pb-20">
			{/* Header */}
			<div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
							Quay lại
						</button>
						<p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Phiếu khám bệnh</p>
						<h1 className="mt-2 text-3xl font-bold text-slate-900">{patientName}</h1>
						<p className="mt-1 text-sm text-slate-500">
							{new Date(visit.visitDate).toLocaleString("vi-VN")} — {visit.doctorName}
						</p>
					</div>
					<span className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
						visit.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
						visit.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" :
						"bg-blue-100 text-blue-700"
					}`}>{visit.status}</span>
				</div>
			</div>

			{/* SOAP Chart */}
			<div className="space-y-4">
				{/* S - Subjective */}
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-black">S</div>
						<div>
							<p className="font-bold text-slate-900">Subjective (Chủ quan)</p>
							<p className="text-xs text-slate-500">Lý do khám, triệu chứng bệnh nhân mô tả</p>
						</div>
					</div>
					<textarea
						value={form.reasonForVisit}
						onChange={(e) => setForm({ ...form, reasonForVisit: e.target.value })}
						placeholder="Bệnh nhân đến khám vì..."
						className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-200 focus:bg-white transition-all resize-none min-h-[100px]"
						disabled={visit.status === "COMPLETED"}
					/>
				</div>

				{/* O - Objective */}
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-black">O</div>
						<div>
							<p className="font-bold text-slate-900">Notes (Khám & Ghi chú)</p>
							<p className="text-xs text-slate-500">Kết quả khám lâm sàng, dữ liệu khách quan</p>
						</div>
					</div>
					<textarea
						value={form.notes}
						onChange={(e) => setForm({ ...form, notes: e.target.value })}
						placeholder="Mạch: ... Nhiệt độ: ... Huyết áp: ... Kết quả khám: ..."
						className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-200 focus:bg-white transition-all resize-none min-h-[150px]"
						disabled={visit.status === "COMPLETED"}
					/>
				</div>

				{/* A - Assessment */}
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-black">A</div>
						<div>
							<p className="font-bold text-slate-900">Assessment (Chẩn đoán)</p>
							<p className="text-xs text-slate-500">Chẩn đoán xác định, chẩn đoán phân biệt</p>
						</div>
					</div>
					<textarea
						value={form.diagnosis}
						onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
						placeholder="Chẩn đoán: ..."
						className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-200 focus:bg-white transition-all resize-none min-h-[120px]"
						disabled={visit.status === "COMPLETED"}
					/>
				</div>

				{/* P - Plan */}
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-black">P</div>
						<div>
							<p className="font-bold text-slate-900">Plan (Kế hoạch điều trị)</p>
							<p className="text-xs text-slate-500">Thuốc, xét nghiệm, tái khám, hướng dẫn</p>
						</div>
					</div>
					<textarea
						value={form.treatmentPlan}
						onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })}
						placeholder="1. Thuốc: ...&#10;2. Xét nghiệm: ...&#10;3. Tái khám: ...&#10;4. Lời dặn: ..."
						className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-200 focus:bg-white transition-all resize-none min-h-[150px]"
						disabled={visit.status === "COMPLETED"}
					/>
				</div>
			</div>

			{/* Actions */}
			{visit.status !== "COMPLETED" && (
				<div className="flex justify-end gap-3">
					<Button variant="secondary" onClick={handleSave} disabled={saving}>
						{saving ? "Đang lưu..." : "Lưu nháp"}
					</Button>
					<Button onClick={handleComplete} disabled={saving || !form.diagnosis}>
						Hoàn tất khám
					</Button>
				</div>
			)}
		</div>
	);
}
