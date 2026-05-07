"use client";

import { useEffect, useState } from "react";
import { visitApi } from "@/services/visit.api";
import { listPatients } from "@/services/patient.api";
import { Button } from "@/components/ui/button";

interface QueueItem {
  patientId: string;
  patientName: string;
  phone: string;
  status: string;
  checkInTime: string;
  reason: string;
}

export default function StaffQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const patients = await listPatients();
        const items: QueueItem[] = patients.map((p: any) => ({
          patientId: p.patientId,
          patientName: p.fullName,
          phone: p.phoneNumber || "",
          status: "CHO_KHAM",
          checkInTime: p.createdAt,
          reason: "",
        }));
        setQueue(items.slice(0, 10));
      } catch {
        setQueue([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = queue.filter((item) =>
    item.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  const moveToNext = (patientId: string) => {
    setQueue((prev) => prev.filter((item) => item.patientId !== patientId));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "CHO_KHAM": return "bg-amber-100 text-amber-700";
      case "DANG_KHAM": return "bg-blue-100 text-blue-700";
      case "DA_XONG": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "CHO_KHAM": return "Chờ khám";
      case "DANG_KHAM": return "Đang khám";
      case "DA_XONG": return "Đã xong";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-700">Vận hành</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Hàng chờ phòng khám</h1>
        <p className="mt-2 text-slate-600">Theo dõi bệnh nhân đang chờ và điều phối phòng khám.</p>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          placeholder="Tìm tên bệnh nhân..."
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Queue Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-violet-600 p-6 text-white shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-200">Đang chờ</p>
          <p className="mt-2 text-3xl font-black">{queue.filter((q) => q.status === "CHO_KHAM").length}</p>
        </div>
        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Đang khám</p>
          <p className="mt-2 text-3xl font-black">{queue.filter((q) => q.status === "DANG_KHAM").length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng hôm nay</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{queue.length}</p>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-400 py-8">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="font-bold text-slate-400">Hàng chờ trống.</p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.patientId}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-violet-100 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 font-black text-lg">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{item.patientName}</p>
                    <p className="text-sm text-slate-500">{item.phone || "Chưa có SĐT"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColor(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                  <a
                    href={`/dashboard/patients/${item.patientId}`}
                    className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-all"
                  >
                    Khám
                  </a>
                  {item.status === "CHO_KHAM" && (
                    <button
                      onClick={() => moveToNext(item.patientId)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-all"
                      title="Xóa khỏi hàng chờ"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
