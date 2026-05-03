"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { assignRole, createUser, getUsers } from "@/services/admin.api";
import { archiveForm, listForms, unarchiveForm } from "@/services/form.api";
import { FormListItem } from "@/types/form";
import { Role, UserProfile } from "@/types/user";

const roles: Role[] = ["ADMIN", "DOCTOR", "PATIENT", "STAFF"];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("DOCTOR");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, []);

  useEffect(() => {
    const loadForms = async () => {
      setFormsLoading(true);
      try {
        const data = await listForms();
        setForms(data);
      } finally {
        setFormsLoading(false);
      }
    };

    void loadForms();
  }, []);

  const handleAssignRole = async (userId: string, nextRole: Role) => {
    const updated = await assignRole({ userId, role: nextRole });
    setUsers((prev) => prev.map((item) => (item.userId === userId ? updated : item)));
  };

  const columns = [
    { key: "username", header: "Người dùng" },
    { key: "email", header: "Email" },
    { key: "role", header: "Vai trò" },
    { key: "createdAt", header: "Ngày tạo" },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: UserProfile) => (
        <div className="flex flex-wrap gap-2">
          {roles
            .filter((roleItem) => roleItem !== row.role)
            .map((roleItem) => (
              <button
                key={`${row.userId}-${roleItem}`}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => void handleAssignRole(row.userId, roleItem)}
              >
                {roleItem}
              </button>
            ))}
        </div>
      ),
    },
  ];

  const handleCreate = async () => {
    const user = await createUser({ username, email, password, role });
    setUsers((prev) => [user, ...prev]);
    setOpen(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("DOCTOR");
  };

  const handleArchiveForm = async (formId: string) => {
    const archived = await archiveForm(formId);
    setForms((prev) => prev.map((item) => (
      item.formId === formId
        ? { ...item, status: archived.status, publicForm: archived.publicForm, updatedAt: archived.updatedAt ?? item.updatedAt }
        : item
    )));
  };

  const handleUnarchiveForm = async (formId: string) => {
    const restored = await unarchiveForm(formId);
    setForms((prev) => prev.map((item) => (
      item.formId === formId
        ? { ...item, status: restored.status, publicForm: restored.publicForm, updatedAt: restored.updatedAt ?? item.updatedAt }
        : item
    )));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Khu vực quản trị</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý người dùng</h1>
        <p className="mt-2 text-slate-600">Tạo tài khoản và gán vai trò cho bác sĩ, bệnh nhân, nhân sự vận hành.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Danh sách người dùng</h2>
        <Button onClick={() => setOpen(true)}>Tạo người dùng</Button>
      </div>

      {loading ? <p className="text-sm text-slate-500">Đang tải danh sách người dùng...</p> : null}
      <Table columns={columns} rows={users} rowKey={(row) => row.userId} />

      <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Giám sát biểu mẫu</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Lưu trữ / Vô hiệu hóa biểu mẫu</h2>
          </div>
        </div>

        {formsLoading ? <p className="text-sm text-slate-500">Đang tải danh sách biểu mẫu...</p> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => (
            <article key={form.formId} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{form.title}</h3>
                <span className="text-xs font-semibold text-slate-500">{form.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{form.description}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => void handleArchiveForm(form.formId)}
                  disabled={form.status === "ARCHIVED"}
                >
                  {form.status === "ARCHIVED" ? "Đã lưu trữ" : "Lưu trữ"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void handleUnarchiveForm(form.formId)}
                  disabled={form.status !== "ARCHIVED"}
                >
                  Khôi phục
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tạo người dùng mới">
        <div className="space-y-3">
          <Input label="Tên người dùng" value={username} onChange={(event) => setUsername(event.target.value)} />
          <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Mật khẩu tạm thời"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span>Vai trò</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 outline-none"
            >
              {roles.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <Button className="w-full" onClick={handleCreate}>
            Lưu người dùng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
