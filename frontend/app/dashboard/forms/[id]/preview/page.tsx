"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormRenderer } from "@/components/form/form-renderer";
import { getForm } from "@/services/form.api";
import { FormDefinition } from "@/types/form";
import { toast } from "@/components/ui/toast";

export default function PreviewFormPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [form, setForm] = useState<FormDefinition | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showShare, setShowShare] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await getForm(params.id);
				setForm(data);
			} catch {
				setForm(null);
				setError("Không tải được bản xem trước. Vui lòng thử lại.");
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, [params.id]);

	const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/forms/${params.id}` : "";

	const copyPublicUrl = async () => {
		try {
			await navigator.clipboard.writeText(publicUrl);
			toast.success("Đã sao chép URL công khai");
		} catch {
			toast.error("Không thể sao chép URL");
		}
	};

	if (loading) {
		return <div className="text-slate-500">Đang tải bản xem trước biểu mẫu...</div>;
	}

	if (error || !form) {
		return (
			<div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
				<p className="font-semibold">{error ?? "Không thể hiển thị bản xem trước."}</p>
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
		<div className="space-y-4">
			<div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Xem trước</p>
					<p className="mt-1 text-sm text-slate-600">Bản xem trước của bác sĩ trước khi xuất bản</p>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={() => setShowShare(!showShare)}>
						{showShare ? "Ẩn mã QR" : "Chia sẻ biểu mẫu"}
					</Button>
					<button
						className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
						onClick={() => router.back()}
					>
						Quay lại
					</button>
				</div>
			</div>

			{showShare && (
				<div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
					<h3 className="text-lg font-semibold text-emerald-900">Chia sẻ biểu mẫu với bệnh nhân</h3>
					<p className="mt-1 text-sm text-emerald-700">
						Bệnh nhân có thể truy cập biểu mẫu qua liên kết hoặc quét mã QR bên dưới.
					</p>

					<div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
						<div className="flex-1">
							<label className="mb-2 block text-sm font-medium text-slate-700">URL công khai</label>
							<div className="flex gap-2">
								<input
									type="text"
									readOnly
									value={publicUrl}
									className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
								/>
								<Button onClick={copyPublicUrl}>Sao chép</Button>
							</div>
						</div>

						<div className="flex flex-col items-center">
							<label className="mb-2 block text-sm font-medium text-slate-700">Mã QR</label>
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`}
								alt="QR Code"
								className="rounded-lg border border-slate-200 bg-white p-2"
								width={150}
								height={150}
							/>
						</div>
					</div>
				</div>
			)}

			<FormRenderer form={form} mode="doctor" />
		</div>
	);
}