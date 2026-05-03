"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { listMyForms, deleteForm, cloneForm } from "@/services/form.api";
import { FormListItem } from "@/types/form";

export default function DashboardMyFormsPage() {
	const [forms, setForms] = useState<FormListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				setForms(await listMyForms());
			} catch (err) {
				setError("Không tải được danh sách biểu mẫu. Vui lòng thử lại.");
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, []);

	const handleDelete = async (formId: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa biểu mẫu này?")) return;
		try {
			await deleteForm(formId);
			setForms((current) => current.filter((item) => item.formId !== formId));
			toast.success("Đã xóa biểu mẫu");
		} catch (err) {
			toast.error("Không thể xóa biểu mẫu");
		}
	};

	const handleClone = async (formId: string) => {
		try {
			await cloneForm(formId);
			toast.success("Đã tạo bản sao biểu mẫu");
			// Refresh list properly
			const updatedList = await listMyForms();
			setForms(updatedList);
		} catch (err) {
			toast.error("Không thể sao chép biểu mẫu");
		}
	};

	return (
		<div className="space-y-6">
			<div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Biểu mẫu của tôi</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý biểu mẫu cá nhân</h1>
				<p className="mt-2 text-slate-600">
					Danh sách biểu mẫu bạn đã tạo. Biểu mẫu mẫu (Template) chỉ có thể sao chép, không chỉnh sửa.
				</p>
			</div>

			<div className="flex justify-end gap-2">
				<Link href="/dashboard/forms/templates">
					<Button variant="outline">Xem mẫu biểu mẫu</Button>
				</Link>
				<Link href="/dashboard/forms/create">
					<Button>Tạo biểu mẫu mới</Button>
				</Link>
			</div>

			{loading ? <p className="text-slate-500">Đang tải danh sách biểu mẫu...</p> : null}
			{error ? <p className="text-sm text-rose-600">{error}</p> : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{forms.map((form) => (
					<div key={form.formId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<p className="text-xs uppercase tracking-[0.2em] text-slate-500">{form.status}</p>
							{form.template ? (
								<Badge variant="secondary" className="bg-amber-100 text-amber-700">
									Mẫu
								</Badge>
							) : (
								<Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
									Biểu mẫu
								</Badge>
							)}
						</div>

						<h2 className="mt-2 wrap-break-word text-2xl font-semibold text-slate-900">{form.title}</h2>
						<p className="mt-3 min-h-16 wrap-break-word text-sm leading-6 text-slate-600">{form.description}</p>

						<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
							<span>{form.sectionCount} phần</span>
							<span>{form.paid ? `${form.price}đ` : "Miễn phí"}</span>
						</div>

						<div className="mt-5 flex flex-wrap gap-2">
							<Link href={`/dashboard/forms/${form.formId}/edit`}>
								<Button
									size="sm"
									variant={form.template ? "secondary" : "primary"}
									disabled={form.template}
									title={form.template ? "Biểu mẫu mẫu không thể chỉnh sửa trực tiếp" : ""}
								>
									{form.template ? "Xem" : "Chỉnh sửa"}
								</Button>
							</Link>
							<Link href={`/dashboard/forms/${form.formId}/preview`}>
								<Button size="sm" variant="outline">
									Xem trước
								</Button>
							</Link>
							{form.template ? (
								<Button size="sm" variant="outline" onClick={() => handleClone(form.formId)}>
									Sử dụng mẫu
								</Button>
							) : (
								<Button size="sm" variant="secondary" onClick={() => handleDelete(form.formId)}>
									Xóa
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			{!loading && !error && forms.length === 0 ? (
				<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-600 shadow-sm">
					Bạn chưa tạo biểu mẫu nào.{" "}
					<Link href="/dashboard/forms/create" className="text-cyan-600 underline">
						Tạo biểu mẫu đầu tiên
					</Link>
				</div>
			) : null}
		</div>
	);
}
