import { SiteShell } from "@/components/marketing/site-shell";

export const metadata = {
	title: "About | Family Healthcare System",
	description: "Learn about the healthcare SaaS platform, form engine, and CDSS-ready data model.",
};

export default function AboutPage() {
	return (
		<SiteShell>
			<main className="px-6 py-16 lg:px-10">
				<div className="mx-auto max-w-7xl space-y-12">
					<section className="relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)] lg:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-50/50 blur-3xl" />
            
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Giới thiệu</p>
                <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                  Nền tảng y học gia đình <br />
                  <span className="text-emerald-600">hướng dữ liệu</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  Hệ thống kết hợp biểu mẫu tiếp nhận (intake), thông tin khuyến cáo 
                  và mô-đun tính toán chỉ số lâm sàng để tạo một luồng vận hành thống nhất 
                  cho bệnh nhân, bác sĩ và đội ngũ y tế.
                </p>
              </div>
              <div className="rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">Tầm nhìn</p>
                <p className="mt-4 text-2xl font-black leading-tight">Mọi tương tác đều có cấu trúc để phục vụ CDSS.</p>
                <p className="mt-4 text-sm leading-7 text-emerald-50/80">
                  Chúng tôi ưu tiên khả năng mở rộng, tích hợp backend hiện đại 
                  để cung cấp dữ liệu sạch cho các bộ chấm điểm (scoring) và bảng điều khiển (dashboard) lâm sàng.
                </p>
                <div className="mt-8 flex gap-3">
                  <div className="h-1.5 w-12 rounded-full bg-emerald-400" />
                  <div className="h-1.5 w-4 rounded-full bg-white/30" />
                  <div className="h-1.5 w-4 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
					</section>

					<section className="grid gap-6 md:grid-cols-3">
						{[
							["Dữ liệu cấu trúc", "Chuẩn hóa thông tin triệu chứng, tiền sử và bối cảnh gia đình ngay từ đầu."],
							["Quy trình bác sĩ", "Công cụ cho phép bác sĩ tạo, chỉnh sửa và xuất bản biểu mẫu theo chuyên khoa."],
							["Sẵn sàng cho CDSS", "Mô hình dữ liệu session + answer được thiết kế tối ưu cho các bộ tính điểm nguy cơ."],
						].map(([title, description]) => (
							<article key={title} className="group rounded-[2.5rem] border border-emerald-50 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <div className="mb-4 h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
								<h2 className="text-xl font-black text-slate-900">{title}</h2>
								<p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
							</article>
						))}
					</section>
				</div>
			</main>
		</SiteShell>
	);
}