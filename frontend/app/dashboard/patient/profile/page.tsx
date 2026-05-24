"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyPatientProfileV2, updateMyPatientProfile } from "@/services/patient-profile.api";
import { PatientProfileRequest } from "@/types/patient-profile";
import { useAuth } from "@/hooks/useAuth";

const emptyForm: PatientProfileRequest = {
  hoTen: "",
  ngaySinh: "",
  gioiTinh: "",
  danToc: "",
  quocTich: "",
  soDienThoaiCaNhan: "",
  email: "",
  diaChiHienTai: "",
  hoTenNguoiLienHe: "",
  moiQuanHe: "",
  soDienThoaiNguoiLienHe: "",
  ngheNghiep: "",
  noiLamViec: "",
};

const normalizeGender = (value?: string | null): PatientProfileRequest["gioiTinh"] => {
  if (value === "Nam" || value === "Nu" || value === "Khac") {
    return value;
  }

  return "";
};

export default function PatientSelfProfilePage() {
  const { hydrated, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState<PatientProfileRequest>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  type ProfileLike = {
    hoTen?: string | null;
    ngaySinh?: string | null;
    gioiTinh?: string | null;
    danToc?: string | null;
    quocTich?: string | null;
    soDienThoaiCaNhan?: string | null;
    email?: string | null;
    diaChiHienTai?: string | null;
    hoTenNguoiLienHe?: string | null;
    moiQuanHe?: string | null;
    soDienThoaiNguoiLienHe?: string | null;
    ngheNghiep?: string | null;
    noiLamViec?: string | null;
  };

  const buildBaseForm = useCallback(
    (): PatientProfileRequest => ({
      ...emptyForm,
      hoTen: user?.fullName || user?.username || "",
      email: user?.email || "",
    }),
    [user?.email, user?.fullName, user?.username],
  );

  const applyProfile = useCallback(
    (profile: ProfileLike, baseForm: PatientProfileRequest): PatientProfileRequest => ({
      ...baseForm,
      hoTen: profile.hoTen ?? baseForm.hoTen,
      ngaySinh: profile.ngaySinh ?? "",
      gioiTinh: normalizeGender(profile.gioiTinh),
      danToc: profile.danToc ?? "",
      quocTich: profile.quocTich ?? "",
      soDienThoaiCaNhan: profile.soDienThoaiCaNhan ?? "",
      email: profile.email ?? baseForm.email,
      diaChiHienTai: profile.diaChiHienTai ?? "",
      hoTenNguoiLienHe: profile.hoTenNguoiLienHe ?? "",
      moiQuanHe: profile.moiQuanHe ?? "",
      soDienThoaiNguoiLienHe: profile.soDienThoaiNguoiLienHe ?? "",
      ngheNghiep: profile.ngheNghiep ?? "",
      noiLamViec: profile.noiLamViec ?? "",
    }),
    [],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setMessage("");
      const baseForm = buildBaseForm();
      setForm(baseForm);

      try {
        const profile = await getMyPatientProfileV2();
        const nextForm = applyProfile(profile, baseForm);
        setForm(nextForm);
        setHasProfile(true);
      } catch {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [applyProfile, buildBaseForm, hydrated, isAuthenticated]);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!form.hoTen.trim()) next.hoTen = "hoTen la bat buoc";
    if (!form.ngaySinh) next.ngaySinh = "ngaySinh la bat buoc";
    if (!form.soDienThoaiCaNhan.trim()) next.soDienThoaiCaNhan = "soDienThoaiCaNhan la bat buoc";
    if (!form.soDienThoaiNguoiLienHe.trim()) next.soDienThoaiNguoiLienHe = "soDienThoaiNguoiLienHe la bat buoc";
    return next;
  }, [form]);

  const onChange = (key: keyof PatientProfileRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const savedProfile = await updateMyPatientProfile(form);
      const nextForm = applyProfile(savedProfile, buildBaseForm());
      setForm(nextForm);
      setMessage("Cập nhật hồ sơ thành công.");
      setHasProfile(true);
    } catch (error: unknown) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      setMessage(errorResponse.response?.data?.message || "Lỗi xảy ra khi lưu hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Đang tải hồ sơ...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-sm text-slate-500">Bạn cần đăng nhập để xem hồ sơ cá nhân.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Hồ sơ bệnh nhân</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Cập nhật hồ sơ của tôi
        </h1>
      </div>

      {!hasProfile ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Họ tên và email được lấy từ tài khoản đăng nhập, không chỉnh sửa tại đây. Hãy cập nhật các thông tin còn lại rồi bấm Cập nhật hồ sơ.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <Input
          label="Họ và tên *"
          name="hoTen"
          value={form.hoTen}
          onChange={(e) => onChange("hoTen", e.target.value)}
          error={errors.hoTen}
          disabled
          className="bg-slate-100 cursor-not-allowed opacity-60"
        />
        <Input label="Ngày sinh *" name="ngaySinh" type="date" value={form.ngaySinh} onChange={(e) => onChange("ngaySinh", e.target.value)} error={errors.ngaySinh} />

        <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
          <span>Giới tính</span>
          <select
            name="gioiTinh"
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-2"
            value={form.gioiTinh ?? ""}
            onChange={(e) => onChange("gioiTinh", e.target.value)}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nu">Nữ</option>
            <option value="Khac">Khác</option>
          </select>
        </label>

        <Input label="Dân tộc" name="danToc" value={form.danToc ?? ""} onChange={(e) => onChange("danToc", e.target.value)} />
        <Input label="Quốc tịch" name="quocTich" value={form.quocTich ?? ""} onChange={(e) => onChange("quocTich", e.target.value)} />
        <Input
          label="Số điện thoại cá nhân *"
          name="soDienThoaiCaNhan"
          value={form.soDienThoaiCaNhan}
          onChange={(e) => onChange("soDienThoaiCaNhan", e.target.value)}
          error={errors.soDienThoaiCaNhan}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email ?? ""}
          onChange={(e) => onChange("email", e.target.value)}
          disabled
          className="bg-slate-100 cursor-not-allowed opacity-60"
        />
        <Input label="Địa chỉ hiện tại" name="diaChiHienTai" value={form.diaChiHienTai ?? ""} onChange={(e) => onChange("diaChiHienTai", e.target.value)} />
        <Input label="Nghề nghiệp" name="ngheNghiep" value={form.ngheNghiep ?? ""} onChange={(e) => onChange("ngheNghiep", e.target.value)} />
        <Input label="Nơi làm việc" name="noiLamViec" value={form.noiLamViec ?? ""} onChange={(e) => onChange("noiLamViec", e.target.value)} />
        <Input label="Họ tên người liên hệ" name="hoTenNguoiLienHe" value={form.hoTenNguoiLienHe ?? ""} onChange={(e) => onChange("hoTenNguoiLienHe", e.target.value)} />
        <Input label="Mối quan hệ" name="moiQuanHe" value={form.moiQuanHe ?? ""} onChange={(e) => onChange("moiQuanHe", e.target.value)} />

        <Input
          label="Số điện thoại người liên hệ *"
          name="soDienThoaiNguoiLienHe"
          value={form.soDienThoaiNguoiLienHe}
          onChange={(e) => onChange("soDienThoaiNguoiLienHe", e.target.value)}
          error={errors.soDienThoaiNguoiLienHe}
        />

        

        <div className="md:col-span-2 flex items-center justify-between">
          <p className="text-sm text-slate-600">{message}</p>
          <Button type="submit" disabled={saving || Object.keys(errors).length > 0}>
            {saving ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
