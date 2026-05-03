"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTemplates, cloneForm } from "@/services/form.api";
import { FormListItem } from "@/types/form";
import { toast } from "@/components/ui/toast";

export default function TemplateLibraryPage() {
	const [templates, setTemplates] = useState<FormListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				setTemplates(await listTemplates());
			} catch (err) {
				setError("Không tải được danh sách mẫu biểu mẫu. Vui lòng thử lại.");
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, []);

	const handleClone = async (templateId: string, title: string) => {
		try {
			await cloneForm(templateId);
			toast.success(`Đã tạo bản sao từ mẫu: ${title}`);
		} catch (err) {
			toast.error("Không thể sao chép mẫu biểu mẫu");
		}
	};

	return (
		<div className="space-y-6">
			<div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-amber-700">Thư viện mẫu</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">Thư viện biểu mẫu mẫu</h1>
				<p className="mt-2 text-slate-600">
					Sử dụng các mẫu biểu mẫu có sẵn để nhanh chóng tạo biểu mẫu mới. Nhấn &quot;Sử dụng mẫu&quot; để sao chép và chỉnh sửa.
				</p>
			</div>

			{loading ? <p className="text-slate-500">Đang tải mẫu biểu mẫu...</p> : null}
			{error ? <p className="text-sm text-rose-600">{error}</p> : null}

			{templates.length === 0 && !loading ? (
				<Card>
					<CardContent className="py-8 text-center text-slate-500">
						Không có mẫu biểu mẫu nào khả dụng.
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{templates.map((template) => (
						<Card key={template.formId} className="overflow-hidden">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">{template.title}</CardTitle>
									<Badge variant="outline" className="bg-amber-50 text-amber-700">
										Mẫu
									</Badge>
								</div>
								<p className="text-sm text-slate-500 line-clamp-2">{template.description}</p>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-sm text-slate-500">
										<span>{template.sectionCount} phần</span>
										<span className="mx-2">•</span>
										<span>{template.paid ? `${template.price}đ` : "Miễn phí"}</span>
									</div>
									<Button size="sm" onClick={() => handleClone(template.formId, template.title)}>
										Sử dụng mẫu
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
