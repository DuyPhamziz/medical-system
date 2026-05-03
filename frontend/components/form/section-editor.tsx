"use client";

import { useState } from "react";
import { FormSection, FormQuestion } from "@/types/form";
import { QuestionEditor } from "./question-editor";
import { LogicEditor } from "./logic-editor";

type Props = {
	section: FormSection;
	allQuestions?: FormQuestion[];
	activeId?: string | null;
	onChange: (updates: Partial<FormSection>) => void;
	onRemove: () => void;
	onUpdateQuestion: (qId: string, updates: Partial<FormQuestion>) => void;
	onRemoveQuestion: (qId: string) => void;
	onAddQuestion: (type: any) => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	onFocusSection?: () => void;
	onFocusQuestion?: (qId: string) => void;
};

export function SectionEditor({ 
	section, 
	allQuestions = [],
	activeId, 
	onChange, 
	onRemove, 
	onUpdateQuestion,
	onRemoveQuestion,
	onAddQuestion,
	onMoveUp, 
	onMoveDown, 
	onFocusSection, 
	onFocusQuestion 
}: Props) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [showLogic, setShowLogic] = useState(false);

	return (
		<div
			data-id={section.sectionId}
			onClick={(e) => {
				e.stopPropagation();
				onFocusSection?.();
			}}
			className={`group relative space-y-6 rounded-[2.5rem] border bg-white p-8 transition-all duration-500 ${activeId === section.sectionId ? 'border-emerald-500 ring-8 ring-emerald-50/50 shadow-2xl' : 'border-slate-100 hover:border-emerald-200 shadow-sm'}`}
		>
			{/* SECTION INDICATOR */}
			<div className={`absolute -left-3 top-10 flex h-14 w-1.5 rounded-full bg-emerald-500 transition-all duration-500 ${activeId === section.sectionId ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-100">
						{section.orderIndex + 1}
					</div>
					<div className="flex flex-col">
						<span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50">Phần biểu mẫu</span>
						<span className="text-xs font-bold text-slate-400">
							{isCollapsed ? `${section.questions.length} câu hỏi` : 'Thiết lập thông tin chung cho nhóm câu hỏi'}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className={`flex items-center gap-1 transition-all duration-300 ${activeId === section.sectionId ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
						<button onClick={(e) => { e.stopPropagation(); setShowLogic(true); }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors">
							<div className="p-1 rounded-lg bg-slate-50">⚡</div>
							<span className="text-[10px] font-black uppercase tracking-widest">Logic</span>
						</button>
						<div className="mx-2 h-4 w-px bg-slate-100" />
						{onMoveUp && (
							<button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
							</button>
						)}
						{onMoveDown && (
							<button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
							</button>
						)}
						<div className="mx-2 h-4 w-px bg-slate-100" />
						<button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
							<span className="text-[10px] font-black uppercase tracking-widest">Xóa</span>
						</button>
					</div>
					
					<button 
						onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
						className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
					>
						<svg className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
					</button>
				</div>
			</div>

			{showLogic && (
				<LogicEditor 
					item={section} 
					allQuestions={allQuestions} 
					onChange={onChange} 
					onClose={() => setShowLogic(false)} 
				/>
			)}

			{!isCollapsed && (
				<>
					<div className="grid gap-8 md:grid-cols-[1fr_240px] animate-in fade-in slide-in-from-top-2 duration-300">
						<div className="space-y-4">
							<input
								placeholder="Tiêu đề phần (Ví dụ: Tiền sử bệnh lý...)"
								className="w-full bg-transparent text-2xl font-black text-slate-900 outline-none placeholder:text-slate-200 focus:placeholder:text-slate-300 transition-all"
								value={section.title}
								onChange={(event) => onChange({ title: event.target.value })}
							/>
							<textarea
								placeholder="Mô tả thêm cho phần này..."
								rows={1}
								className="w-full resize-none bg-transparent text-sm font-medium text-slate-400 outline-none placeholder:text-slate-200 focus:placeholder:text-slate-300 transition-all"
								value={section.description ?? ""}
								onChange={(event) => onChange({ description: event.target.value })}
								onInput={(e) => {
									const target = e.target as HTMLTextAreaElement;
									target.style.height = "auto";
									target.style.height = `${target.scrollHeight}px`;
								}}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhãn nút lặp lại</label>
							<div className="relative group/input">
								<div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
								</div>
								<input
									placeholder="Thêm bản ghi..."
									className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200"
									value={section.repeatLabel ?? ""}
									onChange={(event) => onChange({ repeatLabel: event.target.value })}
								/>
							</div>
						</div>
					</div>

					{/* QUESTIONS LIST */}
					<div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
						{section.questions.map((question) => (
							<QuestionEditor
								key={question.questionId}
								question={question}
								allQuestions={allQuestions}
								activeId={activeId}
								onFocus={(e) => {
									e?.stopPropagation();
									if (question.questionId) onFocusQuestion?.(question.questionId);
								}}
								onChange={(updates) => onUpdateQuestion(question.questionId!, updates)}
								onRemove={() => onRemoveQuestion(question.questionId!)}
								onDuplicate={() => {
									const duplicated: FormQuestion = {
										...question,
										questionId: crypto.randomUUID(),
										orderIndex: section.questions.length,
									};
									onChange({ questions: [...section.questions, duplicated] });
								}}
							/>
						))}
					</div>

					<div className="flex items-center justify-between border-t border-slate-50 pt-6 animate-in fade-in duration-700">
						<label className="inline-flex cursor-pointer items-center gap-4 rounded-2xl bg-slate-50/50 px-5 py-3 transition-all hover:bg-emerald-50 group/check border border-transparent hover:border-emerald-100">
							<div className="relative flex h-5 w-5 items-center justify-center">
								<input
									type="checkbox"
									className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
									checked={section.allowRepeat}
									onChange={(event) => onChange({ allowRepeat: event.target.checked })}
								/>
								<svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							</div>
							<div className="flex flex-col">
								<span className="text-xs font-black uppercase tracking-widest text-slate-700 group-hover/check:text-emerald-700">Cho phép lặp lại phần này</span>
								<span className="text-[10px] font-bold text-slate-400">Bệnh nhân có thể điền nhiều bản ghi cùng loại</span>
							</div>
						</label>

						<button 
							onClick={() => onAddQuestion("text")}
							className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
							Thêm câu hỏi
						</button>
					</div>
				</>
			)}
		</div>
	);
}
