"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FormDefinition } from "@/types/form";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { BuilderToolbar } from "./builder-toolbar";
import { SectionEditor } from "./section-editor";
import { FormHeader } from "./form-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormRenderer } from "./form-renderer";

type Props = {
	initialForm: FormDefinition;
	mode?: "create" | "edit";
	onSave?: (data: FormDefinition) => Promise<void>;
	onPublish?: (data: FormDefinition) => Promise<void>;
};

export function FormBuilder({ initialForm, mode, onSave, onPublish }: Props) {
	const { 
		form, 
		setForm, 
		addSection, 
		updateSection, 
		removeSection, 
		addQuestion, 
		updateQuestion, 
		removeQuestion, 
		onReorderSections 
	} = useFormBuilder(initialForm);
	
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

	// Auto-save logic
	useEffect(() => {
		if (!onSave || mode === 'create') return;

		const timer = setTimeout(async () => {
			setIsSaving(true);
			try {
				await onSave(form);
				setLastSavedTime(new Date());
			} catch (error) {
				console.error("Auto-save failed:", error);
			} finally {
				setIsSaving(false);
			}
		}, 3000); // Save after 3 seconds of inactivity

		return () => clearTimeout(timer);
	}, [form, onSave, mode]);

	// Sync internal state if initialForm changes from props (after successful API save)
	useEffect(() => {
		if (initialForm) {
			setForm(initialForm);
		}
	}, [initialForm, setForm]);

	const toggleSection = (sectionId: string) => {
		setExpandedSections(prev => ({
			...prev,
			[sectionId]: !prev[sectionId]
		}));
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			onReorderSections(active.id.toString(), over!.id.toString());
		}
	};

	const handleSave = async () => {
		if (onSave) {
			setIsSaving(true);
			try {
				await onSave(form);
			} catch (error) {
				console.error("Lưu biểu mẫu thất bại:", error);
			} finally {
				setIsSaving(false);
			}
		}
	};

	const handlePublish = async () => {
		if (onPublish) {
			setIsSaving(true);
			try {
				await onPublish(form);
			} catch (error) {
				console.error("Xuất bản biểu mẫu thất bại:", error);
			} finally {
				setIsSaving(false);
			}
		}
	};

	return (
		<div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
			{/* FIXED SIDEBAR */}
			<aside className={`relative flex flex-col border-r bg-white transition-all duration-500 ease-in-out z-20 shrink-0 ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-72'}`}>
				<div className="flex items-center justify-between border-b p-6 shrink-0">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
						</div>
						<h2 className="text-lg font-black tracking-tight text-slate-800">Cấu trúc</h2>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
					<div className="space-y-2">
						{form.sections.map((s, idx) => {
							const isExpanded = expandedSections[s.sectionId!] ?? true;
							const hasActiveQuestion = s.questions.some(q => q.questionId === activeId);
							const isActiveSection = s.sectionId === activeId;

							return (
								<div key={s.sectionId} className="space-y-1">
									<div 
										className={`group/item flex w-full items-center gap-2 rounded-xl p-2 transition-all ${isActiveSection || hasActiveQuestion ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
									>
										<button 
											onClick={() => toggleSection(s.sectionId!)}
											className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${isExpanded ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
										>
											<svg className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
										</button>

										<button 
											onClick={() => {
												setActiveId(s.sectionId!);
												const el = document.querySelector(`[data-id="${s.sectionId}"]`);
												el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
											}}
											className={`flex-1 truncate text-left text-xs font-bold transition-colors ${isActiveSection ? 'text-emerald-700' : 'text-slate-500'}`}
										>
											<span className="mr-2 opacity-50">S{idx + 1}</span>
											{s.title || "Phần chưa có tiêu đề"}
										</button>
									</div>
									
									{isExpanded && (
										<div className="ml-7 border-l-2 border-slate-100 pl-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
											{s.questions.length > 0 ? (
												s.questions.map((q, qIdx) => (
													<button
														key={q.questionId}
														onClick={() => {
															setActiveId(q.questionId!);
															document.querySelector(`[data-id="${q.questionId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
														}}
														className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-[11px] font-medium transition-all ${activeId === q.questionId ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
													>
														<span className="opacity-40 shrink-0">Q{qIdx + 1}</span>
														<span className="truncate">{q.content || "Câu hỏi trống..."}</span>
													</button>
												))
											) : (
												<p className="py-1 text-[10px] italic text-slate-300 pl-2">Chưa có câu hỏi</p>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
				
				<div className="p-4 border-t shrink-0 bg-white">
					<Button 
						variant="ghost" 
						size="sm"
						className="w-full justify-start gap-2 font-bold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
						onClick={() => addSection()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M12 21v-6"/></svg>
						Thêm phần mới
					</Button>
				</div>
			</aside>

			<div className="relative flex flex-1 flex-col min-w-0 overflow-hidden group">
				<button 
					onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
					className={`absolute left-0 top-1/2 z-30 -translate-y-1/2 transform rounded-r-xl bg-white border border-l-0 border-slate-200 p-1.5 text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-500 ${isSidebarCollapsed ? 'translate-x-0' : 'translate-x-0 opacity-0 group-hover:opacity-100'}`}
					title={isSidebarCollapsed ? "Hiện thanh cấu trúc" : "Ẩn thanh cấu trúc"}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
						{isSidebarCollapsed ? <path d="m9 18 6-6-6-6"/> : <path d="m15 18-6-6 6-6"/>}
					</svg>
				</button>

				<header className="z-10 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md">
					<div className="flex items-center gap-4">
						<span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
							{mode === 'edit' ? 'Chế độ chỉnh sửa' : 'Tạo biểu mẫu mới'}
						</span>
						<div className="h-4 w-px bg-slate-200" />
						<h1 className="text-sm font-bold text-slate-600 truncate max-w-[300px]">{form.title || "Biểu mẫu không tên"}</h1>
						
						{/* Saving Indicator */}
						<div className="flex items-center gap-2 ml-4">
							{isSaving ? (
								<div className="flex items-center gap-1.5 text-emerald-600 animate-pulse">
									<div className="h-1.5 w-1.5 rounded-full bg-emerald-600"></div>
									<span className="text-[11px] font-bold">Đang tự động lưu...</span>
								</div>
							) : lastSavedTime ? (
								<div className="flex items-center gap-1.5 text-slate-400">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
									<span className="text-[11px] font-medium">Đã lưu lúc {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
								</div>
							) : null}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button 
							variant="ghost" 
							className="font-bold text-slate-500 hover:text-slate-900"
							onClick={() => setShowPreview(true)}
						>
							Xem trước
						</Button>
						<div className="h-6 w-px bg-slate-100 mx-1" />
						<Button 
							variant="outline"
							onClick={handlePublish}
							disabled={isSaving}
							className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 font-bold transition-all"
						>
							Xuất bản
						</Button>
						<Button 
							onClick={handleSave} 
							disabled={isSaving}
							className="bg-emerald-600 px-6 font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
						>
							{isSaving ? "Đang lưu..." : "Lưu biểu mẫu"}
						</Button>
					</div>
				</header>
				
				<main className="flex-1 overflow-y-auto bg-slate-50/50 p-8 pt-12 custom-scrollbar" onClick={(e) => {
					if (e.target === e.currentTarget) setActiveId(null);
				}}>
					<div className="mx-auto max-w-3xl space-y-12 pb-40">
						<FormHeader 
							form={form} 
							setForm={setForm} 
						/>

						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={form.sections.map(s => s.sectionId!)} strategy={verticalListSortingStrategy}>
								<div className="space-y-12">
									{form.sections.map((section) => (
										<SectionEditor
											key={section.sectionId}
											section={section}
											allQuestions={form.sections.flatMap(s => s.questions)}
											activeId={activeId}
											onFocusQuestion={(qId) => setActiveId(qId)}
											onFocusSection={() => setActiveId(section.sectionId!)}
											onChange={(updates) => updateSection(section.sectionId!, updates)}
											onRemove={() => removeSection(section.sectionId!)}
											onUpdateQuestion={(qId, updates) => updateQuestion(section.sectionId!, qId, updates)}
											onRemoveQuestion={(qId) => removeQuestion(section.sectionId!, qId)}
											onAddQuestion={(type) => addQuestion(section.sectionId!, type)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>

						<div className="flex justify-center pt-8">
							<Button 
								variant="outline" 
								className="group flex h-24 w-full max-w-md flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white transition-all hover:border-emerald-300 hover:bg-emerald-50/50" 
								onClick={() => addSection()}
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
								</div>
								<span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-600">Thêm phần mới</span>
							</Button>
						</div>
					</div>
				</main>

				<BuilderToolbar 
					activeId={activeId} 
					onAddQuestion={(id) => {
						const section = form.sections.find(s => s.sectionId === id || s.questions.some(q => q.questionId === id));
						if (section) {
							addQuestion(section.sectionId!, "text");
						}
					}}
					onAddSection={() => addSection()}
				/>
			</div>

			<Modal 
				open={showPreview} 
				onClose={() => setShowPreview(false)} 
				title="Xem trước biểu mẫu"
			>
				<div className="max-h-[80vh] overflow-y-auto p-1">
					{showPreview && (
						<FormRenderer 
							form={form} 
							onSubmit={async (data) => {
								console.log("Preview submission:", data);
								setShowPreview(false);
							}}
						/>
					)}
				</div>
			</Modal>
		</div>
	);
}
