import { SiteShell } from "@/components/marketing/site-shell";
import { formulaItems } from "@/features/marketing/content";

export const metadata = {
  title: "Công thức chỉ số | Hệ thống y học gia đình",
  description: "Tổng hợp công thức tính các chỉ số sức khỏe sử dụng trong hệ thống.",
};

export default function FormulasPage() {
  return (
    <SiteShell>
      <main className="px-6 py-16 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <section className="mb-12 relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white p-10 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)]">
            <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-lime-50/50 blur-3xl" />
            <div className="relative">
              <p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Công thức chỉ số</p>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                Thư viện <span className="text-emerald-600">công thức</span> <br />
                lâm sàng chuẩn hóa
              </h1>
              <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600">
                Tập hợp các công thức tính toán chỉ số sức khỏe được sử dụng trong hệ thống 
                để đảm bảo tính chính xác và nhất quán trong đánh giá lâm sàng.
              </p>
            </div>
          </section>

          <section className="grid gap-6">
            {formulaItems.map((item) => (
              <article key={item.name} className="group overflow-hidden rounded-[2.5rem] border border-emerald-50 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-grow space-y-4">
                    <h2 className="text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{item.name}</h2>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm leading-7 text-slate-600 italic">
                        <span className="font-bold not-italic text-slate-900">Mục đích:</span> {item.useCase}
                      </p>
                      <p className="text-sm leading-7 text-slate-600">
                        <span className="font-bold text-slate-900">Lưu ý:</span> {item.caution}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[40%] rounded-3xl bg-slate-50 p-6 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 group-hover:text-emerald-400">Công thức tính</p>
                    <code className="block font-mono text-lg font-bold text-slate-700 group-hover:text-emerald-800 break-words leading-relaxed">
                      {item.formula}
                    </code>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
