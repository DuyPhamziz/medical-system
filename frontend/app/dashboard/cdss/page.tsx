"use client";

import { useEffect, useState } from "react";
import { visitApi } from "@/services/visit.api";
import { listPatients, getPatientDashboard } from "@/services/patient.api";

interface PatientRisk {
  patientId: string;
  patientName: string;
  age: number;
  bmi: number | null;
  bp: string;
  riskLevel: "THAP" | "TRUNG_BINH" | "CAO" | "RAT_CAO";
  lastVisit: string;
  flags: string[];
}

export default function CdssDashboardPage() {
  const [patients, setPatients] = useState<PatientRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await listPatients();
        const enriched: PatientRisk[] = await Promise.all(
          list.slice(0, 20).map(async (p: any) => {
            let bmi: number | null = null;
            let bp = "--/--";
            let flags: string[] = [];
            let lastVisit = "";
            try {
              const dash = await getPatientDashboard(p.patientId);
              if (dash.vitalSignsHistory?.length > 0) {
                const latest = dash.vitalSignsHistory[0];
                bmi = latest.bmi ?? null;
                bp = `${latest.bloodPressureSystolic || "--"}/${latest.bloodPressureDiastolic || "--"}`;
                if (latest.bloodPressureSystolic && latest.bloodPressureSystolic > 140) flags.push("Tăng huyết áp");
                if (latest.bmi && latest.bmi > 25) flags.push("Thừa cân");
                if (latest.heartRate && latest.heartRate > 100) flags.push("Nhịp tim nhanh");
              }
              lastVisit = dash?.recentVisits?.[0]?.visitDate || "";
            } catch {}
            const riskLevel = flags.length >= 2 ? "CAO" : flags.length === 1 ? "TRUNG_BINH" : "THAP";
            return {
              patientId: p.patientId,
              patientName: p.fullName,
              age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 0,
              bmi,
              bp,
              riskLevel: riskLevel as any,
              lastVisit,
              flags,
            };
          })
        );
        setPatients(enriched);
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = filterRisk === "all" ? patients : patients.filter((p) => p.riskLevel === filterRisk);

  const riskColor = (level: string) => {
    switch (level) {
      case "RAT_CAO": return "bg-red-100 text-red-700 border-red-200";
      case "CAO": return "bg-orange-100 text-orange-700 border-orange-200";
      case "TRUNG_BINH": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };
  const riskLabel = (level: string) => {
    switch (level) {
      case "RAT_CAO": return "Rất cao";
      case "CAO": return "Cao";
      case "TRUNG_BINH": return "Trung bình";
      default: return "Thấp";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">CDSS</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Hỗ trợ quyết định lâm sàng</h1>
        <p className="mt-2 text-slate-600">Phân tầng nguy cơ bệnh nhân dựa trên chỉ số sinh tồn và lịch sử khám.</p>
      </div>

      {/* Risk Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {(["RAT_CAO", "CAO", "TRUNG_BINH", "THAP"] as const).map((level) => (
          <div key={level} className={`rounded-2xl border p-6 shadow-sm ${riskColor(level)}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{riskLabel(level)}</p>
            <p className="mt-2 text-3xl font-black">{patients.filter((p) => p.riskLevel === level).length}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "RAT_CAO", "CAO", "TRUNG_BINH", "THAP"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterRisk(f)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filterRisk === f ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? "Tất cả" : riskLabel(f)}
          </button>
        ))}
      </div>

      {/* Patient List */}
      {loading ? (
        <p className="text-center text-slate-400 py-8">Đang phân tích...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <a
              key={p.patientId}
              href={`/dashboard/patients/${p.patientId}`}
              className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-rose-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg border ${riskColor(p.riskLevel)}`}>
                  {p.patientName[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{p.patientName}</p>
                  <p className="text-sm text-slate-500">{p.age} tuổi · {p.bp}</p>
                  {p.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.flags.map((f) => (
                        <span key={f} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${riskColor(p.riskLevel)}`}>
                  {riskLabel(p.riskLevel)}
                </span>
                {p.bmi && <p className="text-xs text-slate-400 mt-1">BMI: {p.bmi.toFixed(1)}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
