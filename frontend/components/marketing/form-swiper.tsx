import Link from "next/link";
import { FormListItem } from "@/types/form";

type Props = {
  forms: FormListItem[];
};

export function FormSwiper({ forms }: Props) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-14 lg:px-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 border border-emerald-100">Khám phá</p>
          <h2 className="mt-4 text-3xl font-black text-slate-900 md:text-4xl">Danh sách biểu mẫu công khai</h2>
        </div>
        <Link href="/forms/public" className="group flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
          Xem tất cả
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-emerald-100 bg-white/50 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-lg font-bold text-slate-900">Hiện chưa có biểu mẫu nào</p>
          <p className="mt-2 text-sm text-slate-500">Các biểu mẫu công khai sẽ xuất hiện tại đây sau khi được bác sĩ xuất bản.</p>
        </div>
      ) : (
        <div className="flex snap-x gap-6 overflow-x-auto pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {forms.map((form) => (
            <article
              key={form.formId}
              className="group min-w-[320px] snap-start rounded-[2.5rem] border border-emerald-50 bg-white p-6 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.1)] transition-all hover:border-emerald-200 hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.2)] hover:-translate-y-1"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border border-emerald-100">
                  {form.status === "PUBLISHED" ? "Đã xuất bản" : form.status}
                </span>
                <span className="text-xs font-bold text-slate-400">{form.sectionCount} phần khám</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{form.title}</h3>
              <p className="mt-3 min-h-[4.5rem] text-sm leading-7 text-slate-600 line-clamp-3">{form.description}</p>
              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chi phí</span>
                  <span className="text-sm font-black text-slate-900">{form.paid ? `${form.price.toLocaleString()}đ` : "Miễn phí"}</span>
                </div>
                <Link
                  href={form.paid ? `/forms/${form.formId}/payment` : `/forms/${form.formId}`}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                >
                  Mở biểu mẫu
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
