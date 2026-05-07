"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prescriptionApi } from "@/services/prescription.api";
import { Medication, Prescription, CreatePrescriptionItem } from "@/types/prescription";

export default function PrescriptionPage() {
	const params = useParams<{ patientId: string; visitId: string }>();
	const router = useRouter();
	const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
	const [medications, setMedications] = useState<Medication[]>([]);
	const [loading, setLoading] = useState(true);
	const [showNew, setShowNew] = useState(false);
	const [note, setNote] = useState("");
	const [items, setItems] = useState<CreatePrescriptionItem[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<Medication[]>([]);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const [rxList, meds] = await Promise.all([
					prescriptionApi.getByVisit(params.visitId),
					prescriptionApi.getMedications(),
				]);
				setPrescriptions(rxList);
				setMedications(meds);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, [params.visitId]);

	useEffect(() => {
		if (searchTerm.length < 1) {
			setSearchResults([]);
			return;
		}
		const filtered = medications.filter((m) =>
			m.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setSearchResults(filtered.slice(0, 5));
	}, [searchTerm, medications]);

	const addItem = (med: Medication) => {
		setItems((prev) => [
			...prev,
			{ medicationId: med.medicationId, dosage: "", frequency: "", duration: "" },
		]);
		setSearchTerm("");
		setSearchResults([]);
	};

	const updateItem = (index: number, field: string, value: string) => {
		setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
	};

	const removeItem = (index: number) => {
		setItems((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		try {
			await prescriptionApi.create({
				visitId: params.visitId,
				note: note || undefined,
				items,
			});
			setShowNew(false);
			setItems([]);
			setNote("");
			const rxList = await prescriptionApi.getByVisit(params.visitId);
			setPrescriptions(rxList);
		} catch (err) {
			console.error(err);
		}
	};

	const getMedName = (medId: string) => {
		return medications.find((m) => m.medicationId === medId)?.name || medId;
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
						Quay lại
					</button>
					<h1 className="text-2xl font-bold text-slate-900">Kê đơn thuốc</h1>
				</div>
				<Button onClick={() => setShowNew(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
					Kê đơn mới
				</Button>
			</div>

			{/* Existing Prescriptions */}
			{loading ? (
				<p className="text-center text-slate-400 py-8">Đang tải...</p>
			) : prescriptions.length === 0 && !showNew ? (
				<div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
					<p className="font-bold text-slate-400">Chưa có đơn thuốc nào.</p>
				</div>
			) : (
				<div className="space-y-4">
					{prescriptions.map((rx) => (
						<div key={rx.prescriptionId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between mb-4">
								<p className="text-xs font-bold text-slate-400">
									{new Date(rx.createdAt).toLocaleString("vi-VN")}
								</p>
							</div>
							{rx.note && <p className="text-sm text-slate-600 mb-4 italic">{rx.note}</p>}
							<table className="w-full text-left">
								<thead>
									<tr className="border-b border-slate-100">
										<th className="pb-2 text-[10px] font-bold uppercase text-slate-400">Thuốc</th>
										<th className="pb-2 text-[10px] font-bold uppercase text-slate-400">Liều</th>
										<th className="pb-2 text-[10px] font-bold uppercase text-slate-400">Tần suất</th>
										<th className="pb-2 text-[10px] font-bold uppercase text-slate-400">Thời gian</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-50">
									{rx.items.map((item, i) => (
										<tr key={i}>
											<td className="py-3 text-sm font-bold text-slate-900">{item.medicationName || getMedName(item.medicationId)}</td>
											<td className="py-3 text-sm text-slate-600">{item.dosage}</td>
											<td className="py-3 text-sm text-slate-600">{item.frequency}</td>
											<td className="py-3 text-sm text-slate-600">{item.duration}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
				</div>
			)}

			{/* New Prescription Form */}
			{showNew && (
				<div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
					<h3 className="text-lg font-bold text-slate-900 mb-4">Đơn thuốc mới</h3>

					{/* Medication Search */}
					<div className="relative mb-4">
						<input
							placeholder="Tìm thuốc (gõ tên)..."
							className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						{searchResults.length > 0 && (
							<div className="absolute z-10 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
								{searchResults.map((med) => (
									<button
										key={med.medicationId}
										onClick={() => addItem(med)}
										className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-emerald-50 transition-colors"
									>
										<span className="font-bold text-slate-900">{med.name}</span>
										<span className="text-xs text-slate-400">{med.unit}</span>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Items */}
					<div className="space-y-3">
						{items.map((item, index) => (
							<div key={index} className="flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4">
								<div className="flex-1 min-w-[150px]">
									<p className="text-xs font-bold text-slate-500 mb-1">Thuốc</p>
									<p className="font-bold text-slate-900">{getMedName(item.medicationId)}</p>
								</div>
								<div className="w-24">
									<p className="text-xs font-bold text-slate-500 mb-1">Liều</p>
									<input
										placeholder="VD: 500mg"
										className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
										value={item.dosage}
										onChange={(e) => updateItem(index, "dosage", e.target.value)}
									/>
								</div>
								<div className="w-28">
									<p className="text-xs font-bold text-slate-500 mb-1">Tần suất</p>
									<input
										placeholder="VD: 2 lần/ngày"
										className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
										value={item.frequency}
										onChange={(e) => updateItem(index, "frequency", e.target.value)}
									/>
								</div>
								<div className="w-24">
									<p className="text-xs font-bold text-slate-500 mb-1">Thời gian</p>
									<input
										placeholder="VD: 7 ngày"
										className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
										value={item.duration}
										onChange={(e) => updateItem(index, "duration", e.target.value)}
									/>
								</div>
								<button
									onClick={() => removeItem(index)}
									className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
								</button>
							</div>
						))}
					</div>

					{/* Note */}
					<div className="mt-4">
						<textarea
							placeholder="Ghi chú đơn thuốc (cách dùng, lưu ý...)"
							className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-300 focus:bg-white transition-all resize-none min-h-[80px]"
							value={note}
							onChange={(e) => setNote(e.target.value)}
						/>
					</div>

					{/* Actions */}
					<div className="mt-4 flex justify-end gap-3">
						<Button variant="secondary" onClick={() => { setShowNew(false); setItems([]); setNote(""); }}>
							Hủy
						</Button>
						<Button onClick={handleSave} disabled={items.length === 0}>
							Lưu đơn thuốc
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
