"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { getPatientForms } from "@/services/patient.api";
import { PatientFormResponse } from "@/types/patient";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/user";

// Mock patient data - in real implementation, this would come from a patient listing API
const mockPatients = [
  {
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    fullName: "Nguyễn Văn An",
    email: "nguyenvana@example.com",
    username: "nguyenvana",
    createdAt: "2025-01-15T10:30:00",
  },
  {
    patientId: "550e8400-e29b-41d4-a716-446655440002",
    fullName: "Trần Thị Bình",
    email: "tranbinh@example.com",
    username: "tranbinh",
    createdAt: "2025-02-20T14:45:00",
  },
  {
    patientId: "550e8400-e29b-41d4-a716-446655440003",
    fullName: "Lê Văn Cường",
    email: "lecrong@example.com",
    username: "lecrong",
    createdAt: "2025-03-10T09:15:00",
  },
];

type Column = {
  key: string;
  header: string;
  render: (row: typeof mockPatients[0]) => React.ReactNode;
};

export default function DoctorPatientsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientForms, setPatientForms] = useState<PatientFormResponse[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column[] = [
    {
      key: "name",
      header: "Họ tên",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.fullName}</p>
          <p className="text-xs text-slate-500">@{row.username}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => <span className="text-slate-700">{row.email}</span>,
    },
    {
      key: "created",
      header: "Ngày tạo",
      render: (row) => (
        <span className="text-slate-600">
          {new Date(row.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" href={`/dashboard/patients/${row.patientId}`}>
            Xem chi tiết
          </Button>
          <Button size="sm" href={`/dashboard/forms?patientId=${row.patientId}`}>
            Tạo biểu mẫu
          </Button>
        </div>
      ),
    },
  ];

  const handleViewForms = async (patientId: string) => {
    setSelectedPatient(patientId);
    setLoadingForms(true);
    try {
      const forms = await getPatientForms(patientId);
      setPatientForms(forms);
    } catch (error) {
      console.error("Failed to load forms:", error);
      setPatientForms([]);
    } finally {
      setLoadingForms(false);
    }
  };

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
          <Table
            columns={columns}
            rows={filteredPatients}
            rowKey={(row) => row.patientId}
          />
        </CardContent>
      </Card>

      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu mẫu gần đây</CardTitle>
            <CardDescription>
              Các biểu mẫu bệnh nhân đã hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingForms ? (
              <p className="py-4 text-center text-slate-500">
                Đang tải dữ liệu...
              </p>
            ) : patientForms.length === 0 ? (
              <p className="py-4 text-center text-slate-500">
                Bệnh nhân chưa có biểu mẫu nào
              </p>
            ) : (
              <div className="space-y-3">
                {patientForms.slice(0, 5).map((form) => (
                  <div
                    key={form.sessionId}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {form.formTitle}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(form.startedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          form.status === "SUBMITTED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {form.status === "SUBMITTED" ? "Đã nộp" : "Bản nháp"}
                      </span>
                      <span className="font-semibold text-indigo-600">
                        {form.totalScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
