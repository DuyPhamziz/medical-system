export interface Appointment {
  appointmentId: string;
  doctorId: string;
  doctorName: string | null;
  patientId: string;
  patientName: string | null;
  roomId: string | null;
  roomName: string | null;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface CreateAppointmentRequest {
  doctorId: string;
  patientId: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export const APPOINTMENT_STATUS = [
  { value: "SCHEDULED", label: "Đã lên lịch", color: "bg-blue-100 text-blue-700" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700" },
  { value: "IN_PROGRESS", label: "Đang khám", color: "bg-amber-100 text-amber-700" },
  { value: "COMPLETED", label: "Hoàn tất", color: "bg-slate-100 text-slate-700" },
  { value: "CANCELLED", label: "Đã hủy", color: "bg-red-100 text-red-700" },
] as const;
