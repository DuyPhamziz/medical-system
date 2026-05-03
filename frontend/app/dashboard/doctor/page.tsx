"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
  const tab = searchParams.get("tab");
  const { hydrated } = useAuth();

  useEffect(() => {
    // Redirect to patients tab by default if no tab specified
    if (!tab && window.location.pathname === "/dashboard/doctor") {
      window.history.replaceState({}, "", "/dashboard/doctor?tab=patients");
    }
  }, [tab]);

  const renderTabContent = () => {
    switch (tab) {
      case "patients":
        return <PatientsPage />;
      case "visits":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Lượt khám</CardTitle>
              <CardDescription>
                Quản lý lịch khám và theo dõi bệnh nhân đang chờ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-slate-500">
                Tính năng đang được phát triển
              </p>
            </CardContent>
          </Card>
        );
      case "diagnosis":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chẩn đoán</CardTitle>
              <CardDescription>
                Công cụ hỗ trợ chẩn đoán và đề xuất điều trị
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-slate-500">
                Tính năng đang được phát triển
              </p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Chọn một mục từ menu</CardTitle>
              <CardDescription>
                Sử dụng menu bên trái để điều hướng đến các chức năng
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
          Không gian bác sĩ
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Vận hành lâm sàng
        </h1>
        <p className="mt-2 text-slate-600">
          Theo dõi bệnh nhân, lịch khám, và gợi ý CDSS theo thời gian thực.
        </p>
      </div>

      {renderTabContent()}
    </div>
  );
}
