import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listPublicForms } from "@/services/form.api";
import { SiteShell } from "@/components/marketing/site-shell";

export const metadata = {
	title: "Biểu mẫu công khai | Hệ thống y học gia đình",
	description: "Duyệt biểu mẫu y tế công khai không cần đăng nhập.",
};

export default async function PublicFormsPage() {
	const forms = await listPublicForms().catch(() => []);
	const visibleForms = forms.filter((form) => !form.formId.startsWith("sample-"));

	return (
		<SiteShell>
			<main className="min-h-screen bg-slate-50/50 px-6 py-16 text-slate-900">
				<div className="mx-auto max-w-7xl space-y-12">
					<div className="relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white p-10 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)]">
						<div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-50/50 blur-3xl" />
						<div className="relative">
							<p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Biểu mẫu công khai</p>
							<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">Trải nghiệm biểu mẫu <br /><span className="text-emerald-600">intake y tế</span></h1>
							<p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
								Khám phá danh sách các biểu mẫu đã được chuẩn hóa. Bạn có thể xem và trải nghiệm 
								các biểu mẫu này mà không cần đăng nhập.
							</p>
						</div>
					</div>

					{visibleForms.length === 0 ? (
						<div className="rounded-[3rem] border-2 border-dashed border-emerald-100 bg-white p-16 text-center shadow-sm">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
								<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
							</div>
							<h2 className="text-2xl font-black text-slate-900">Chưa có biểu mẫu nào</h2>
							<p className="mt-3 text-slate-500">Hệ thống đang được cập nhật các biểu mẫu mới. Vui lòng quay lại sau.</p>
						</div>
					) : (
						<div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
							{visibleForms.map((form) => (
								<article key={form.formId} className="group flex flex-col rounded-[2.5rem] border border-emerald-50 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
									<div className="flex items-center justify-between">
										<span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border border-emerald-100">
											{form.status === "PUBLISHED" ? "Đã xuất bản" : form.status}
										</span>
										<span className="text-xs font-bold text-slate-400">{form.sectionCount} phần khám</span>
									</div>
									<h2 className="mt-8 text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{form.title}</h2>
									<p className="mt-4 text-sm leading-7 text-slate-600 flex-grow">{form.description}</p>
									
									<div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-8">
										<div className="flex flex-col">
											<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chi phí</span>
											<span className="text-sm font-black text-slate-900">{form.paid ? `${form.price.toLocaleString()}đ` : "Miễn phí"}</span>
										</div>
										<Link href={form.paid ? `/forms/${form.formId}/payment` : `/forms/${form.formId}`}>
											<Button className="rounded-xl bg-emerald-600 px-6 py-6 text-sm font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95">
												Mở biểu mẫu
											</Button>
										</Link>
									</div>
								</article>
							))}
						</div>
					)}
				</div>
			</main>
		</SiteShell>
	);
}