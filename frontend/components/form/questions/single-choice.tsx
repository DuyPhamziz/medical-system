import { FormQuestion, FormOption } from "@/types/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
	question: FormQuestion;
	repeatIndex: number;
	selectedOptionId: string | null;
	onChange: (repeatIndex: number, optionId: string | null) => void;
	// Support for "Other" text
	valueText?: string;
	onValueTextChange?: (repeatIndex: number, text: string) => void;
};

export function SingleChoiceQuestion({ 
	question, 
	repeatIndex, 
	selectedOptionId, 
	onChange,
	valueText = "",
	onValueTextChange
}: Props) {
	const [isOther, setIsOther] = useState(selectedOptionId === "other");

	const handleOptionChange = (optionId: string | null) => {
		setIsOther(optionId === "other");
		onChange(repeatIndex, optionId);
	};

	return (
		<div className="grid gap-3">
			{question.options.map((option: FormOption) => (
				<label 
					key={option.optionId} 
					className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
						selectedOptionId === option.optionId 
							? "border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600" 
							: "border-slate-100 hover:border-slate-200 bg-white"
					}`}
				>
					<input
						type="radio"
						name={`${question.questionId}-${repeatIndex}`}
						checked={selectedOptionId === option.optionId}
						onChange={() => handleOptionChange(option.optionId)}
						className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-600"
					/>
					<span className={`text-sm font-bold ${selectedOptionId === option.optionId ? "text-cyan-900" : "text-slate-600"}`}>
						{option.content}
					</span>
				</label>
			))}

			{question.allowOther && (
				<div className="space-y-2">
					<label 
						className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
							isOther 
								? "border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600" 
								: "border-slate-100 hover:border-slate-200 bg-white"
						}`}
					>
						<input
							type="radio"
							name={`${question.questionId}-${repeatIndex}`}
							checked={isOther}
							onChange={() => handleOptionChange("other")}
							className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-600"
						/>
						<span className={`text-sm font-bold ${isOther ? "text-cyan-900" : "text-slate-600"}`}>
							Khác / Chưa rõ
						</span>
					</label>

					<AnimatePresence>
						{isOther && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="pl-7"
							>
								<Input
									placeholder="Ghi rõ tại đây..."
									className="rounded-xl border-cyan-200 bg-white font-bold"
									value={valueText}
									onChange={(e) => onValueTextChange?.(repeatIndex, e.target.value)}
									autoFocus
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}
