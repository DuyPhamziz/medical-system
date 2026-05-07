"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { archiveForm, listForms, unarchiveForm } from "@/services/form.api";
import { FormListItem } from "@/types/form";

export function FormsTab() {
	const [forms, setForms] = useState<FormListItem[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				setForms(await listForms());
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, []);

	const handleArchiveForm = async (formId: string) => {
		const archived = await archiveForm(formId);
		setForms((prev) => prev.map((item) =>
			item.formId === formId
				? { ...item, status: archived.status, publicForm: archived.publicForm, updatedAt: archived.updatedAt ?? item.updatedAt }
				: item
		));
	};

	const handleUnarchiveForm = async (formId: string) => {
		const restored = await unarchiveForm(formId);
		setForms((prev) => prev.map((item) =>
			item.formId === formId
				? { ...item, status: restored.status, publicForm: restored.publicForm, updatedAt: restored.updatedAt ?? item.updatedAt }
				: item
		));
	};

	return (
		<div className="space-y-4">
			<div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Giám sát biểu mẫu</p>
						<h2 className="mt-2 text-xl font-semibold text-slate-900">Lưu trữ / Vô hiệu hóa biểu mẫu</h2>
					</div>
				</div>

				{loading ? <p className="mt-4 text-sm text-slate-500">Đang tải danh sách biểu mẫu...</p> : null}
				<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{forms.map((form) => (
						<div key={form.formId} className="rounded-2xl border border-slate-200 p-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-slate-900">{form.title}</h3>
								<span className="text-xs font-semibold text-slate-500">{form.status}</span>
							</div>
							<p className="mt-2 text-sm text-slate-600">{form.description}</p>
							<div className="mt-4 flex gap-2">
								<Button variant="danger" onClick={() => void handleArchiveForm(form.formId)} disabled={form.status === "ARCHIVED"}>
									{form.status === "ARCHIVED" ? "Đã lưu trữ" : "Lưu trữ"}
								</Button>
								<Button variant="secondary" onClick={() => void handleUnarchiveForm(form.formId)} disabled={form.status !== "ARCHIVED"}>
									Khôi phục
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
