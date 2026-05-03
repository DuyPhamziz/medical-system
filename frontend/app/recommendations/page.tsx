import { SiteShell } from "@/components/marketing/site-shell";
import { recommendationItems } from "@/features/marketing/content";

export const metadata = {
  title: "Khuyến cáo | Hệ thống y học gia đình",
  description: "Thông tin khuyến cáo sức khỏe tổng hợp cho bệnh nhân và gia đình.",
};

export default function RecommendationsPage() {
  return (
    <SiteShell>
      <main className="px-6 py-16 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <section className="mb-12 relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white p-10 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)]">
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-50/50 blur-3xl" />
            <div className="relative">
              <p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Thông tin khuyến cáo</p>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                Hướng dẫn dự phòng <br />
                & <span className="text-emerald-600">theo dõi sức khỏe</span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Hệ thống tổng hợp các hướng dẫn lâm sàng dựa trên bằng chứng, 
                được thiết kế để hỗ trợ bệnh nhân trong việc tự theo dõi và quản lý sức khỏe tại nhà.
              </p>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendationItems.map((item) => (
              <article key={item.title} className="group flex flex-col rounded-[2.5rem] border border-emerald-50 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700 border border-emerald-100">
                    {item.tag}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </div>
                </div>
                <h2 className="mt-6 text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 flex-grow">{item.summary}</p>
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Xem chi tiết
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
