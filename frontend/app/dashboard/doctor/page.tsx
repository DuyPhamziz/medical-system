"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import PatientsPage from "./patients/page";

export default function DoctorDashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "patients";
  const { hydrated } = useAuth();

  useEffect(() => {
    if (!tab) {
      window.history.replaceState({}, "", "/dashboard/doctor?tab=patients");
    }
  }, [tab]);

  const tabs = [
    { key: "patients", label: "Bệnh nhân" },
    { key: "visits", label: "Lượt khám" },
    { key: "diagnosis", label: "Chẩn đoán" },
  ];

  const renderTabContent = () => {
    switch (tab) {
      case "patients":
        return <PatientsPage />;
      case "visits":
        return <DoctorVisitsTab />;
      case "diagnosis":
        return <DoctorDiagnosisTab />;
      default:
        return <PatientsPage />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Không gian bác sĩ</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Vận hành lâm sàng</h1>
        <p className="mt-2 text-slate-600">Theo dõi bệnh nhân, lịch khám và ghi chép hồ sơ.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 overflow-x-auto">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/dashboard/doctor?tab=${t.key}`}
            className={`flex-1 min-w-[100px] rounded-xl py-2.5 text-sm font-bold text-center transition-all ${
              tab === t.key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}

// ============================================================
// Doctor Visits Tab
// ============================================================
function DoctorVisitsTab() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { visitApi } = await import("@/services/visit.api");
        const data = await visitApi.getMyVisits(filter !== "all" ? filter : undefined);
        setVisits(data || []);
      } catch {
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Lượt khám gần đây</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
        >
          <option value="all">Tất cả</option>
          <option value="IN_PROGRESS">Đang khám</option>
          <option value="COMPLETED">Đã hoàn tất</option>
          <option value="SCHEDULED">Chờ khám</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-8 animate-pulse">Đang tải...</p>
      ) : visits.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-bold text-slate-400">Chưa có lượt khám nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v: any) => (
            <div key={v.visitId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-100 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{v.patientName || `BN-${v.patientId?.slice(0,8)}`}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(v.visitDate).toLocaleString("vi-VN")}
                  </p>
                  {v.reasonForVisit && (
                    <p className="text-sm text-slate-600 mt-2">{v.reasonForVisit}</p>
                  )}
                  {v.diagnosis && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm">
                      <span className="font-semibold text-slate-700">CĐ: </span>
                      {v.diagnosis}
                    </div>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  v.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                  v.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                }`}>{v.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Doctor Diagnosis Tab
// ============================================================
function DoctorDiagnosisTab() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { listPatients } = await import("@/services/patient.api");
        const data = await listPatients();
        setPatients(data);
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = patients.filter((p: any) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chẩn đoán & Kê đơn</CardTitle>
          <CardDescription>Chọn bệnh nhân để bắt đầu phiếu khám mới</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            placeholder="Tìm tên bệnh nhân..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="text-center text-slate-400 py-4">Đang tải...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-400 py-4">Không tìm thấy bệnh nhân.</p>
            ) : (
              filtered.map((p: any) => (
                <a
                  key={p.patientId}
                  href={`/dashboard/patients/${p.patientId}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-black">
                    {p.fullName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{p.fullName}</p>
                    <p className="text-xs text-slate-500">{p.email || "Chưa có email"}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Mở hồ sơ →
                  </span>
                </a>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
