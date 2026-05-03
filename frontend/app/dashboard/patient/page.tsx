export default function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-700">Cổng bệnh nhân</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Hành trình chăm sóc</h1>
        <p className="mt-2 text-slate-600">Xem lịch hẹn, hồ sơ y tế và kế hoạch điều trị cá nhân hóa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-500">Lịch hẹn sắp tới</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">25 Apr 2026 - 09:30</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm text-slate-500">Phác đồ đang hoạt động</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">2 phác đồ</p>
        </div>
      </div>
    </div>
  );
}
