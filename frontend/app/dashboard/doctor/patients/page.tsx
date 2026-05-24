"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { listPatients } from "@/services/patient.api";
import { PatientResponse } from "@/types/patient";
import { useAuth } from "@/hooks/useAuth";

type Column = {
  key: string;
  header: string;
  render: (row: PatientResponse) => React.ReactNode;
};

export default function DoctorPatientsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const patientData = await listPatients();
        setPatients(patientData);
      } catch (error) {
        console.error("Failed to load patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column[] = [
    {
      key: "name",
      header: "Họ tên",
      render: (row: PatientResponse) => (
        <div>
          <p className="font-medium text-slate-900">{row.fullName}</p>
          <p className="text-xs text-slate-500">@{row.username || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row: PatientResponse) => <span className="text-slate-700">{row.email || "N/A"}</span>,
    },
    {
      key: "created",
      header: "Ngày tạo",
      render: (row: PatientResponse) => (
        <span className="text-slate-600">
          {new Date(row.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: PatientResponse) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" href={`/dashboard/patients/${row.patientId}`}>
            Xem chi tiết
          </Button>
          <Button size="sm" variant="outline" href={`/dashboard/patients/${row.patientId}?tab=profile`}>
            Xem hồ sơ bệnh nhân
          </Button>
          <Button size="sm" variant="ghost" href={`/dashboard/patients/${row.patientId}?tab=forms`}>
            Biểu mẫu
          </Button>
          <Button size="sm" href={`/dashboard/forms?patientId=${row.patientId}`}>
            Tạo biểu mẫu
          </Button>
        </div>
      ),
    },
  ];

  if (tab !== "patients") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Quản lý bệnh nhân
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Danh sách bệnh nhân
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Xem và quản lý hồ sơ bệnh nhân, theo dõi biểu mẫu đã điền
          </p>
        </div>
        {(role === "ADMIN" || role === "DOCTOR") && (
          <Button>Thêm bệnh nhân mới</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              label="Tìm kiếm"
              placeholder="Tìm theo tên hoặc tên đăng nhập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-4 text-center text-slate-500">Đang tải bệnh nhân...</p>
          ) : filteredPatients.length === 0 ? (
            <p className="py-4 text-center text-slate-500">Không tìm thấy bệnh nhân.</p>
          ) : (
            <Table
              columns={columns}
              rows={filteredPatients}
              rowKey={(row) => row.patientId}
            />
          )}
        </CardContent>
      </Card>

    </div>
  );
}
