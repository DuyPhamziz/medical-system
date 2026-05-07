"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { assignRole, createUser, getUsers } from "@/services/admin.api";
import { Role, UserProfile } from "@/types/user";

const roles: Role[] = ["ADMIN", "DOCTOR", "PATIENT", "STAFF"];

export function UsersTab() {
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<Role>("DOCTOR");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				setUsers(await getUsers());
			} finally {
				setLoading(false);
			}
		};
		void load();
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

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-800">Danh sách người dùng</h2>
				<Button onClick={() => setOpen(true)}>Tạo người dùng</Button>
			</div>

			{loading ? <p className="text-sm text-slate-500">Đang tải danh sách người dùng...</p> : null}
			<Table columns={columns} rows={users} rowKey={(row) => row.userId} />

			<Modal open={open} onClose={() => setOpen(false)} title="Tạo người dùng mới">
				<div className="space-y-3">
					<Input label="Tên người dùng" value={username} onChange={(event) => setUsername(event.target.value)} />
					<Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
					<Input label="Mật khẩu tạm thời" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
					<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
						<span>Vai trò</span>
						<select
							value={role}
							onChange={(event) => setRole(event.target.value as Role)}
							className="h-11 rounded-xl border border-slate-300 bg-white px-3 outline-none"
						>
							{roles.map((value) => (
								<option key={value} value={value}>{value}</option>
							))}
						</select>
					</label>
					<Button className="w-full" onClick={handleCreate}>Lưu người dùng</Button>
				</div>
			</Modal>
		</div>
	);
}
