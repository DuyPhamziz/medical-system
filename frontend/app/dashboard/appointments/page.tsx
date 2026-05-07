"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { appointmentApi } from "@/services/appointment.api";
import { listPatients } from "@/services/patient.api";
import { Appointment, APPOINTMENT_STATUS } from "@/types/appointment";
import { PatientResponse } from "@/types/patient";

export default function DoctorAppointmentsPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreate, setShowCreate] = useState(false);
	const [patients, setPatients] = useState<PatientResponse[]>([]);
	const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
	const [formData, setFormData] = useState({
		patientId: "",
		startTime: "",
		endTime: "",
		reason: "",
	});

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const from = new Date(selectedDate);
				from.setHours(0, 0, 0, 0);
				const to = new Date(selectedDate);
				to.setHours(23, 59, 59, 999);
				const data = await appointmentApi.getByDateRange(from.toISOString(), to.toISOString());
				setAppointments(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, [selectedDate]);

	const loadPatients = async () => {
		try {
			setPatients(await listPatients());
		} catch (err) {
			console.error(err);
		}
	};

	const handleCreate = async () => {
		try {
			await appointmentApi.create({
				doctorId: "", // Will be set from context
				patientId: formData.patientId,
				startTime: new Date(`${selectedDate}T${formData.startTime}`).toISOString(),
				endTime: new Date(`${selectedDate}T${formData.endTime}`).toISOString(),
				reason: formData.reason,
			});
			setShowCreate(false);
			// Refresh
			const from = new Date(selectedDate);
			from.setHours(0, 0, 0, 0);
			const to = new Date(selectedDate);
			to.setHours(23, 59, 59, 999);
			setAppointments(await appointmentApi.getByDateRange(from.toISOString(), to.toISOString()));
		} catch (err) {
			console.error(err);
		}
	};

	const handleCancel = async (appointmentId: string) => {
		if (!confirm("Hủy lịch hẹn này?")) return;
		try {
			await appointmentApi.cancel(appointmentId);
			setAppointments((prev) =>
				prev.map((a) => (a.appointmentId === appointmentId ? { ...a, status: "CANCELLED" as const } : a))
			);
		} catch (err) {
			console.error(err);
		}
	};

	const openCreateDialog = () => {
		void loadPatients();
		const now = new Date();
		const end = new Date(now.getTime() + 30 * 60000);
		setFormData({
			patientId: "",
			startTime: now.toTimeString().slice(0, 5),
			endTime: end.toTimeString().slice(0, 5),
			reason: "",
		});
		setShowCreate(true);
	};

	return (
		<div className="space-y-6">
			<div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Lịch hẹn</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý lịch khám</h1>
				<p className="mt-2 text-slate-600">Xem và quản lý lịch hẹn của bệnh nhân.</p>
			</div>

			{/* Date & Controls */}
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
				<div className="flex items-center gap-3">
					<button
						onClick={() => {
							const d = new Date(selectedDate);
							d.setDate(d.getDate() - 1);
							setSelectedDate(d.toISOString().split("T")[0]);
						}}
						className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-50"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
					</button>
					<input
						type="date"
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-300"
					/>
					<button
						onClick={() => {
							const d = new Date(selectedDate);
							d.setDate(d.getDate() + 1);
							setSelectedDate(d.toISOString().split("T")[0]);
						}}
						className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-50"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
					</button>
				</div>
				<Button onClick={openCreateDialog}>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
					Tạo lịch hẹn
				</Button>
			</div>

			{/* Appointment List */}
			<div className="space-y-3">
				{loading ? (
					<p className="text-center text-slate-500">Đang tải...</p>
				) : appointments.length === 0 ? (
					<div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
						<p className="font-bold text-slate-400">Không có lịch hẹn nào trong ngày này.</p>
					</div>
				) : (
					appointments.map((app) => {
						const statusInfo = APPOINTMENT_STATUS.find((s) => s.value === app.status);
						return (
							<div key={app.appointmentId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-100 transition-all">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-sm">
											{new Date(app.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
										</div>
										<div>
											<p className="font-bold text-slate-900">{app.patientName || "Bệnh nhân"}</p>
											<p className="text-sm text-slate-500">{app.reason || "Không có ghi chú"}</p>
											<p className="text-xs text-slate-400">
												{new Date(app.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
												{" - "}
												{new Date(app.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusInfo?.color || "bg-slate-100 text-slate-700"}`}>
											{statusInfo?.label || app.status}
										</span>
										{app.status === "SCHEDULED" && (
											<button
												onClick={() => handleCancel(app.appointmentId)}
												className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Create Dialog */}
			<Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tạo lịch hẹn mới">
				<div className="space-y-4">
					<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
						<span>Bệnh nhân</span>
						<select
							value={formData.patientId}
							onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
							className="h-11 rounded-xl border border-slate-300 bg-white px-3 outline-none"
						>
							<option value="">Chọn bệnh nhân...</option>
							{patients.map((p) => (
								<option key={p.patientId} value={p.patientId}>{p.fullName}</option>
							))}
						</select>
					</label>

					<div className="grid grid-cols-2 gap-4">
						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
							<span>Giờ bắt đầu</span>
							<input
								type="time"
								value={formData.startTime}
								onChange={(e) => {
									const start = e.target.value;
									const [h, m] = start.split(":").map(Number);
									const end = new Date();
									end.setHours(h, m + 30, 0, 0);
									setFormData({
										...formData,
										startTime: start,
										endTime: end.toTimeString().slice(0, 5),
									});
								}}
								className="h-11 rounded-xl border border-slate-300 bg-white px-3 outline-none"
							/>
						</label>
						<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
							<span>Giờ kết thúc</span>
							<input
								type="time"
								value={formData.endTime}
								onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
								className="h-11 rounded-xl border border-slate-300 bg-white px-3 outline-none"
							/>
						</label>
					</div>

					<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
						<span>Lý do khám</span>
						<textarea
							value={formData.reason}
							onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
							className="h-20 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none resize-none"
						/>
					</label>

					<Button className="w-full" onClick={handleCreate}>Tạo lịch hẹn</Button>
				</div>
			</Modal>
		</div>
	);
}
