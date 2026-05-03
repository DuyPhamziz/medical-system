"use client";

import { FormDefinition, FormVisibility } from "@/types/form";

type Props = {
	form: FormDefinition;
	onChange: (next: FormDefinition) => void;
};

/**
 * Kiểm soát mức hiển thị của biểu mẫu
 * PUBLIC: bệnh nhân có thể truy cập
 * DOCTOR_ONLY: chỉ bác sĩ nội bộ
 * PRIVATE: truy cập theo phân công
 */
export function VisibilityToggle({ form, onChange }: Props) {
	const visibility = form.visibility ?? "DOCTOR_ONLY";

	const setVisibility = (nextVisibility: FormVisibility) => {
		onChange({
			...form,
			visibility: nextVisibility,
			publicForm: nextVisibility === "PUBLIC",
		});
	};

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-4">
			<p className="text-sm font-semibold text-slate-900">Kiểm soát hiển thị</p>
			<p className="mt-1 text-xs text-slate-500">Ai có thể xem và điền biểu mẫu này</p>

			<div className="mt-3 grid gap-2 sm:grid-cols-3">
				{[
					{
						value: "PUBLIC" as const,
						label: "Công khai",
						description: "Bệnh nhân có thể truy cập",
					},
					{
						value: "DOCTOR_ONLY" as const,
						label: "Chỉ bác sĩ",
						description: "Dùng nội bộ cho bác sĩ",
					},
					{
						value: "PRIVATE" as const,
						label: "Riêng tư",
						description: "Chỉ truy cập theo phân công",
					},
				].map((item) => {
					const active = visibility === item.value;
					return (
						<button
							key={item.value}
							type="button"
							onClick={() => setVisibility(item.value)}
							className={`rounded-xl border px-3 py-3 text-left transition ${
								active
									? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200"
									: "border-slate-200 bg-white hover:border-slate-300"
							}`}
						>
							<p className="text-sm font-semibold text-slate-900">{item.label}</p>
							<p className="mt-1 text-xs text-slate-600">{item.description}</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}