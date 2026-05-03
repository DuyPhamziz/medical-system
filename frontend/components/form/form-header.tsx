import { FormDefinition } from "@/types/form";
import { VisibilityToggle } from "./visibility-toggle";

interface FormHeaderProps {
	form: FormDefinition;
	setForm: (form: FormDefinition) => void;
}

export function FormHeader({ form, setForm }: FormHeaderProps) {
	return (
		<div className="space-y-6">
			<div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-md">
				{/* TOP ACCENT BAR */}
				<div className="absolute left-0 right-0 top-0 h-2 bg-emerald-500" />
				
				<div className="space-y-6">
					<div className="space-y-2">
						<label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50">Tiêu đề biểu mẫu</label>
						<input
							className="w-full bg-transparent text-4xl font-black tracking-tight text-slate-900 outline-none placeholder:text-slate-100 focus:placeholder:text-slate-200 transition-all"
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
							placeholder="Biểu mẫu chưa có tiêu đề..."
						/>
					</div>

					<div className="space-y-2">
						<label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50">Mô tả chi tiết</label>
						<textarea
							className="w-full resize-none bg-transparent text-lg font-medium text-slate-400 outline-none placeholder:text-slate-100 focus:placeholder:text-slate-200 transition-all"
							value={form.description || ""}
							onChange={(e) =>
								setForm({ ...form, description: e.target.value })
							}
							placeholder="Mô tả mục đích của biểu mẫu này..."
							rows={1}
							onInput={(e) => {
								const target = e.target as HTMLTextAreaElement;
								target.style.height = "auto";
								target.style.height = `${target.scrollHeight}px`;
							}}
						/>
					</div>
				</div>
			</div>

			<VisibilityToggle form={form} onChange={setForm} />
		</div>
	);
}
