"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface Clinic {
  clinicId: string;
  name: string;
  address: string | null;
  phone: string | null;
}

interface Room {
  roomId: string;
  name: string;
  type: string | null;
}

export default function ClinicManagementPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [roomForm, setRoomForm] = useState({ name: "", type: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { default: apiClient } = await import("@/lib/axios");
        const { data } = await apiClient.get("/clinics");
        setClinics(data || []);
      } catch {
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const loadRooms = async (clinicId: string) => {
    try {
      const { default: apiClient } = await import("@/lib/axios");
      const { data } = await apiClient.get(`/clinics/${clinicId}/rooms`);
      setRooms(data || []);
    } catch {
      setRooms([]);
    }
  };

  const handleCreate = async () => {
    try {
      const { default: apiClient } = await import("@/lib/axios");
      const { data } = await apiClient.post("/clinics", form);
      setClinics((prev) => [...prev, data]);
      setShowCreate(false);
      setForm({ name: "", address: "", phone: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedClinic) return;
    try {
      const { default: apiClient } = await import("@/lib/axios");
      const { data } = await apiClient.post(`/clinics/${selectedClinic}/rooms`, roomForm);
      setRooms((prev) => [...prev, data]);
      setRoomForm({ name: "", type: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Cơ sở vật chất</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý phòng khám</h1>
        <p className="mt-2 text-slate-600">Quản lý cơ sở và phòng khám trực thuộc.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Thêm phòng khám
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Đang tải...</p>
      ) : clinics.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-bold text-slate-400">Chưa có phòng khám nào.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clinics.map((clinic) => (
            <div key={clinic.clinicId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{clinic.name}</h3>
                  {clinic.address && <p className="text-sm text-slate-500 mt-1">{clinic.address}</p>}
                  {clinic.phone && <p className="text-sm text-slate-500 mt-1">{clinic.phone}</p>}
                </div>
                <button
                  onClick={() => {
                    setSelectedClinic(clinic.clinicId);
                    loadRooms(clinic.clinicId);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    selectedClinic === clinic.clinicId
                      ? "bg-cyan-100 text-cyan-700"
                      : "bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                  }`}
                >
                  Phòng ({selectedClinic === clinic.clinicId ? rooms.length : "?"})
                </button>
              </div>

              {/* Rooms */}
              {selectedClinic === clinic.clinicId && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      placeholder="Tên phòng"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    />
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={roomForm.type}
                      onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    >
                      <option value="">Loại</option>
                      <option value="KHAM">Phòng khám</option>
                      <option value="DIEU_TRI">Phòng điều trị</option>
                      <option value="XET_NGHIEM">Xét nghiệm</option>
                    </select>
                    <button
                      onClick={handleCreateRoom}
                      className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700 hover:bg-cyan-100 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rooms.map((room) => (
                      <span key={room.roomId} className="rounded-xl bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-100">
                        {room.name}
                        {room.type && <span className="ml-1 text-[10px] text-slate-400">({room.type})</span>}
                      </span>
                    ))}
                    {rooms.length === 0 && <p className="text-xs text-slate-400">Chưa có phòng</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Thêm phòng khám">
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Tên phòng khám
            <input className="h-11 rounded-xl border border-slate-300 px-3 outline-none" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Địa chỉ
            <input className="h-11 rounded-xl border border-slate-300 px-3 outline-none" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Số điện thoại
            <input className="h-11 rounded-xl border border-slate-300 px-3 outline-none" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <Button className="w-full" onClick={handleCreate}>Lưu</Button>
        </div>
      </Modal>
    </div>
  );
}
