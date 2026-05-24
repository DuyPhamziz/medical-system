"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { listPatientProfiles, updatePatientProfileByDoctor } from "@/services/patient-profile.api";
import { PatientProfile, PatientProfileRequest } from "@/types/patient-profile";

const initialForm: PatientProfileRequest = {
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

export default function DoctorPatientProfilesPage() {
  const [rows, setRows] = useState<PatientProfile[]>([]);
  const [form, setForm] = useState<PatientProfileRequest>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await listPatientProfiles();
      setRows(data);
    } catch {
      setMessage("Khong tai duoc danh sach ho so benh nhan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!form.hoTen.trim()) next.hoTen = "Họ tên là bắt buộc";
    if (!form.ngaySinh) next.ngaySinh = "Ngày sinh là bắt buộc";
    if (!form.soDienThoaiCaNhan.trim()) next.soDienThoaiCaNhan = "Số điện thoại cá nhân là bắt buộc";
    if (!form.soDienThoaiNguoiLienHe.trim()) next.soDienThoaiNguoiLienHe = "Số điện thoại người liên hệ là bắt buộc";
    return next;
  }, [form]);

  const onChange = (key: keyof PatientProfileRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (!editingId) {
        setMessage("Vui lòng chọn một hồ sơ để cập nhật.");
        return;
      }

      await updatePatientProfileByDoctor(editingId, form);
      setMessage("Cập nhật hồ sơ bệnh nhân thành công.");
      setForm(initialForm);
      setEditingId(null);
      setProfileOpen(false);
      await load();
    } catch {
      setMessage("Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row: PatientProfile) => {
    setForm({
      hoTen: row.hoTen ?? "",
      ngaySinh: row.ngaySinh ?? "",
      gioiTinh: row.gioiTinh ?? "",
      danToc: row.danToc ?? "",
      quocTich: row.quocTich ?? "",
      soDienThoaiCaNhan: row.soDienThoaiCaNhan ?? "",
      email: row.email ?? "",
      diaChiHienTai: row.diaChiHienTai ?? "",
      hoTenNguoiLienHe: row.hoTenNguoiLienHe ?? "",
      moiQuanHe: row.moiQuanHe ?? "",
      soDienThoaiNguoiLienHe: row.soDienThoaiNguoiLienHe ?? "",
      ngheNghiep: row.ngheNghiep ?? "",
      noiLamViec: row.noiLamViec ?? "",
    });
    setEditingId(row.maBenhNhan);
    setProfileOpen(true);
  };

  const onCancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
    setProfileOpen(false);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Bác sĩ</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Danh sách bệnh nhân</h1>
        <p className="mt-1 text-sm text-slate-600">Bấm Hồ sơ bệnh nhân để xem và cập nhật thông tin.</p>
      </div>

      {message ? <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p> : null}

      <Modal open={profileOpen} onClose={onCancelEdit} title={editingId ? "Hồ sơ bệnh nhân" : "Hồ sơ bệnh nhân"}>
        <form onSubmit={onUpdate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Họ và tên *" name="hoTen" value={form.hoTen} onChange={(e) => onChange("hoTen", e.target.value)} error={errors.hoTen} />
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

          <Input label="Email" name="email" type="email" value={form.email ?? ""} onChange={(e) => onChange("email", e.target.value)} />
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancelEdit} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving || Object.keys(errors).length > 0}>
              {saving ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">Mã bệnh nhân</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">Họ và tên</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">Ngày sinh</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">SĐT cá nhân</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">SĐT người liên hệ</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={6}>Đang tải dữ liệu...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={6}>Chưa có hồ sơ bệnh nhân.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.maBenhNhan} className="border-b border-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700">{row.maBenhNhan}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{row.hoTen}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{row.ngaySinh}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{row.soDienThoaiCaNhan}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{row.soDienThoaiNguoiLienHe}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <Button size="sm" variant="outline" type="button" onClick={() => onEdit(row)}>
                      Hồ sơ bệnh nhân
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
