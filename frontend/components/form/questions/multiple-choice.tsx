"use client";

import { FormQuestion, FormOption } from "@/types/form";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
	question: FormQuestion;
	repeatIndex: number;
	selectedOptionIds: string[];
	onChange: (repeatIndex: number, optionIds: string[]) => void;
	// Support for "Other" text
	valueText?: string;
	onValueTextChange?: (repeatIndex: number, text: string) => void;
};

export function MultipleChoiceQuestion({ 
	question, 
	repeatIndex, 
	selectedOptionIds, 
	onChange,
	valueText = "",
	onValueTextChange
}: Props) {
	const handleToggle = (optionId: string | undefined, checked: boolean) => {
		if (!optionId) return;

		const currentSelection = selectedOptionIds.filter((id) => id !== optionId);
		const nextSelection = checked ? [...currentSelection, optionId] : currentSelection;

		onChange(repeatIndex, nextSelection);
	};

	const isOtherChecked = selectedOptionIds.includes("other");

	return (
		<div className="grid gap-3">
			{question.options.map((option: FormOption) => (
				<label 
					key={option.optionId} 
					className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
						selectedOptionIds.includes(option.optionId ?? "")
							? "border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600" 
							: "border-slate-100 hover:border-slate-200 bg-white"
					}`}
				>
					<input
						type="checkbox"
						checked={selectedOptionIds.includes(option.optionId ?? "")}
						onChange={(event) => handleToggle(option.optionId, event.target.checked)}
						className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-600 rounded"
					/>
					<span className={`text-sm font-bold ${selectedOptionIds.includes(option.optionId ?? "") ? "text-cyan-900" : "text-slate-600"}`}>
						{option.content}
					</span>
				</label>
			))}

			{question.allowOther && (
				<div className="space-y-2">
					<label 
						className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
							isOtherChecked 
								? "border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600" 
								: "border-slate-100 hover:border-slate-200 bg-white"
						}`}
					>
						<input
							type="checkbox"
							checked={isOtherChecked}
							onChange={(e) => handleToggle("other", e.target.checked)}
							className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-600 rounded"
						/>
						<span className={`text-sm font-bold ${isOtherChecked ? "text-cyan-900" : "text-slate-600"}`}>
							Khác / Chưa rõ
						</span>
					</label>

					<AnimatePresence>
						{isOtherChecked && (
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
