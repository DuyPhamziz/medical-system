import { SiteShell } from "@/components/marketing/site-shell";

export const metadata = {
	title: "Bảng giá | Hệ thống y học gia đình",
	description: "Định hướng gói giá cho phòng khám, nhóm gia đình và luồng biểu mẫu cao cấp.",
};

export default function PricingPage() {
	return (
		<SiteShell>
			<main className="min-h-screen bg-slate-50/50 px-6 py-16 text-slate-900">
				<div className="mx-auto max-w-7xl space-y-12">
					<div className="relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white p-10 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)]">
						<div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-50/50 blur-3xl" />
						<div className="relative">
							<p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Bảng giá</p>
							<h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">Lộ trình <br /><span className="text-emerald-600">triển khai hệ thống</span></h1>
							<p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
								Chúng tôi đang phát triển các gói dịch vụ linh hoạt để phù hợp với nhu cầu của cá nhân, 
								phòng khám gia đình và các tổ chức y tế quy mô lớn.
							</p>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{[
							["Khởi đầu", "Biểu mẫu công khai, đăng nhập bệnh nhân, bảng điều khiển cơ bản.", "Miễn phí"],
							["Phòng khám", "Trình tạo biểu mẫu cho bác sĩ, quản lý lượt khám và bệnh nhân.", "Liên hệ"],
							["Doanh nghiệp", "SSO, pipeline CDSS nâng cao, thanh toán và phân tích chuyên sâu.", "Tùy chỉnh"],
						].map(([title, description, price]) => (
							<div key={title} className="group rounded-[2.5rem] border border-emerald-50 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg">
								<h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{title}</h2>
								<p className="mt-4 text-sm leading-7 text-slate-600 min-h-[4rem]">{description}</p>
								<div className="mt-8 pt-6 border-t border-slate-50">
									<p className="text-2xl font-black text-slate-900">{price}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</SiteShell>
	);
}