import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";
import { FormSwiper } from "@/components/marketing/form-swiper";
import { buildFormShowcase } from "@/features/marketing/content";
import { listPublicForms } from "@/services/form.api";

export const metadata = {
  title: "Hệ thống y học gia đình",
  description: "Trang chủ công khai cho biểu mẫu y tế, hồ sơ gia đình và quy trình intake sẵn sàng cho CDSS.",
};

export default async function Home() {
  const publicForms = await listPublicForms().catch(() => []);
  const showcaseForms = buildFormShowcase(publicForms);
  const maxSectionCount = showcaseForms.length > 0 ? Math.max(...showcaseForms.map((form) => form.sectionCount)) : 0;

  return (
    <SiteShell>
      <main>
        <section className="relative mx-auto w-full max-w-7xl px-6 pb-12 pt-12 lg:px-10 lg:pt-20">
          {/* Decorative Background Elements */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-50 blur-3xl" />
          <div className="absolute top-48 -right-24 h-72 w-72 rounded-full bg-lime-50 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                NỀN TẢNG Y HỌC GIA ĐÌNH
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-7xl">
                Quản lý intake <br />
                <span className="text-emerald-600">thông minh</span>, y tế <br />
                sẵn sàng <span className="text-lime-600">CDSS</span>.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Thiết kế theo luồng thực tế của y khoa gia đình: từ tiếp nhận thông tin, 
                đến phân tích chỉ số và đưa ra khuyến cáo cá nhân hóa. 
                Giao diện tinh gọn, chuyên nghiệp và tối ưu cho dữ liệu lâm sàng.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/forms/public" className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)]">
                  Xem biểu mẫu
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link href="/recommendations" className="rounded-2xl border-2 border-emerald-100 bg-white px-8 py-4 text-lg font-bold text-emerald-700 transition-all hover:border-emerald-200 hover:bg-emerald-50/50">
                  Khuyến cáo
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Intake theo phần", "Biểu mẫu phân cấp rõ ràng theo flow khám."],
                  ["Dữ liệu cấu trúc", "Dễ dàng trích xuất và phân tích tự động."],
                  ["Hỗ trợ quyết định", "Sẵn sàng tích hợp các bộ tiêu chuẩn CDSS."],
                ].map(([title, description]) => (
                  <div key={title} className="group rounded-[2rem] border border-emerald-50 bg-white/50 p-6 shadow-sm transition-all hover:border-emerald-100 hover:bg-white hover:shadow-md backdrop-blur-sm">
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="group relative rounded-[3rem] border border-emerald-100 bg-white p-6 shadow-[0_32px_80px_-24px_rgba(16,185,129,0.2)] transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute -left-4 top-12 h-10 w-10 rotate-12 rounded-2xl bg-lime-300 shadow-lg" />
              <div className="absolute -right-2 -bottom-2 h-16 w-16 rounded-full bg-emerald-100/50 blur-xl" />
              
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-8 text-white shadow-inner">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200/80">Hệ thống phân tích</p>
                    <h2 className="mt-2 text-3xl font-black leading-tight">Dashboard lâm sàng thông minh</h2>
                  </div>
                  <p className="max-w-md text-sm leading-7 text-emerald-50/90">
                    Theo dõi toàn bộ lịch sử sức khỏe gia đình, đánh giá nguy cơ dựa trên dữ liệu intake 
                    và nhận khuyến cáo cá nhân hóa tức thì.
                  </p>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-sm transition-all hover:bg-white/15">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Biểu mẫu hiện có</p>
                    <p className="mt-1 text-4xl font-black">{showcaseForms.length}+</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-sm transition-all hover:bg-white/15">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Độ sâu thông tin</p>
                    <p className="mt-1 text-4xl font-black">{maxSectionCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 border-t border-emerald-50 pt-16">
          <FormSwiper forms={showcaseForms} />
        </div>
      </main>
    </SiteShell>
  );
}
