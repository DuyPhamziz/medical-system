"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form/form-builder";
import { getForm, publishForm, updateForm } from "@/services/form.api";
import { FormDefinition } from "@/types/form";

export default function EditFormPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [form, setForm] = useState<FormDefinition | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await getForm(params.id);
				setForm(data);
			} catch (err: unknown) {
				console.error("Failed to load form:", err);
				const error = err as any;
				let errorMsg = "Không tải được biểu mẫu. ";
				if (error.status === 404) {
					errorMsg = "Biểu mẫu không tồn tại hoặc đã bị xóa.";
				} else if (error.status === 403) {
					errorMsg = "Bạn không có quyền truy cập biểu mẫu này.";
				} else if (error.message) {
					errorMsg += error.message;
				} else {
					errorMsg += "Vui lòng thử lại.";
				}
				setError(errorMsg);
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, [params.id]);

	if (loading) {
		return <div className="text-slate-500">Đang tải biểu mẫu...</div>;
	}

	if (error || !form) {
		return (
			<div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
				<p className="font-semibold">{error ?? "Không thể hiển thị biểu mẫu."}</p>
				<button
					type="button"
					onClick={() => router.push("/dashboard/forms")}
					className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-700"
				>
					Quay về danh sách biểu mẫu
				</button>
			</div>
		);
	}

	return (
		<FormBuilder
			initialForm={form}
			mode="edit"
			onSave={async (nextForm) => {
				const updated = await updateForm(params.id, nextForm as FormDefinition);
				setForm(updated);
			}}
			onPublish={async (nextForm) => {
				await updateForm(params.id, nextForm as FormDefinition);
				const published = await publishForm(params.id);
				setForm(published);
				router.replace(`/dashboard/forms/${params.id}/preview`);
			}}
		/>
	);
}
