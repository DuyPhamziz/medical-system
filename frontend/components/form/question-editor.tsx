"use client";

import { FormQuestion, FormQuestionType } from "@/types/form";
import { useState, useEffect } from "react";
import { LogicEditor } from "./logic-editor";
import { MatrixConfig } from "./builder/MatrixConfig";
import { TimeSeriesConfig } from "./builder/TimeSeriesConfig";
import { ChoiceConfig } from "./builder/ChoiceConfig";
import { ValidationConfig } from "./builder/ValidationConfig";
import { TextConfig } from "./builder/TextConfig";
import { ClinicalScaleConfig } from "./builder/ClinicalScaleConfig";
import { ScoredConfig } from "./builder/ScoredConfig";
import { RepeatableGroupConfig } from "./builder/RepeatableGroupConfig";

const QUESTION_TYPES: FormQuestionType[] = [
  "text", "number", "date", "datetime", "single_choice", "multiple_choice",
  "scale", "matrix", "pedigree", "time_series", "body_map",
  "clinical_scale", "scored", "repeatable_group", "identity"
];

type Props = {
  question: FormQuestion;
  allQuestions?: FormQuestion[];
  activeId?: string | null;
  onChange: (updates: Partial<FormQuestion>) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onFocus?: (e?: React.MouseEvent) => void;
};

export function QuestionEditor({ 
  question, 
  allQuestions = [], 
  activeId, 
  onChange, 
  onRemove, 
  onDuplicate, 
  onMoveUp, 
  onMoveDown, 
  onFocus 
}: Props) {
  const [showLogic, setShowLogic] = useState(false);

  // Auto-sync configJson for Matrix if needed
  useEffect(() => {
    if (question.questionType === "matrix") {
      const rows = question.options
        .filter(o => {
          try { return JSON.parse(o.triggerLogic || "{}").type === "row"; } catch { return false; }
        })
        .map(o => ({ rowId: o.optionId, label: o.content }));
      
      const config = { matrixRows: rows };
      const configJson = JSON.stringify(config);
      
      if ((question as any).configJson !== configJson) {
        onChange({ configJson } as any);
      }
    }
  }, [question.options, question.questionType, onChange]);

  return (
    <div
      data-id={question.questionId}
      onClick={(e) => {
        e.stopPropagation();
        onFocus?.(e);
      }}
      className={`group relative space-y-5 rounded-[2rem] border transition-all duration-300 ${
        activeId === question.questionId 
          ? 'border-emerald-500 ring-8 ring-emerald-50 focus-within:shadow-2xl bg-white' 
          : 'border-slate-100 bg-white hover:border-emerald-200'
      }`}
    >
      <div className={`absolute left-0 top-10 bottom-10 w-1 rounded-r-full bg-emerald-500 transition-opacity ${activeId === question.questionId ? 'opacity-100' : 'opacity-0'}`} />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100">
            Q{question.orderIndex + 1}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Câu hỏi</span>
        </div>

        <div className={`flex items-center gap-1 transition-all duration-300 ${activeId === question.questionId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }} className="p-2 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }} className="p-2 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }} className="p-2 rounded-xl text-slate-300 hover:bg-emerald-50 hover:text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-5 pb-6">
        <textarea
          placeholder="Nội dung câu hỏi..."
          rows={1}
          className="w-full resize-none bg-transparent py-2 text-xl font-bold text-slate-800 outline-none placeholder:text-slate-200"
          value={question.content}
          onChange={(e) => onChange({ content: e.target.value })}
          onInput={(e) => { (e.target as any).style.height = "auto"; (e.target as any).style.height = `${(e.target as any).scrollHeight}px`; }}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kiểu câu hỏi</label>
            <select
              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white"
              value={question.questionType}
              onChange={(e) => onChange({ questionType: e.target.value as any })}
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "text" ? "📝 Văn bản ngắn" :
                   type === "number" ? "🔢 Số" :
                   type === "date" ? "📅 Ngày" :
                   type === "datetime" ? "⏰ Ngày & Giờ" :
                   type === "single_choice" ? "🔘 Một lựa chọn" :
                   type === "multiple_choice" ? "✅ Nhiều lựa chọn" :
                   type === "matrix" ? "📊 Bảng" :
                   type === "pedigree" ? "🌳 Cây phả hệ" :
                   type === "time_series" ? "📈 Theo dõi thời gian" :
                   type === "body_map" ? "🧍 Sơ đồ cơ thể" :
                   type === "clinical_scale" ? "🏥 Thang điểm lâm sàng" :
                   type === "scored" ? "🎯 Câu hỏi tính điểm" :
                   type === "repeatable_group" ? "🔁 Nhóm lặp" :
                   type === "identity" ? "🪪 Nhân khẩu học" :
                   "📈 Thang điểm"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chữ gợi ý</label>
            <input 
              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white" 
              placeholder="Gợi ý..." 
              value={question.placeholder ?? ""} 
              onChange={(e) => onChange({ placeholder: e.target.value })} 
            />
          </div>
        </div>

        {/* RENDER DYNAMIC CONFIG BASED ON TYPE */}
        {question.questionType === "text" && <TextConfig question={question} onChange={onChange} />}
        {question.questionType === "matrix" && <MatrixConfig question={question} onChange={onChange} />}
        {question.questionType === "time_series" && <TimeSeriesConfig question={question} onChange={onChange} />}
        {(question.questionType === "single_choice" || question.questionType === "multiple_choice") && <ChoiceConfig question={question} onChange={onChange} />}
        {question.questionType === "clinical_scale" && <ClinicalScaleConfig question={question} onChange={onChange} />}
        {question.questionType === "scored" && <ScoredConfig question={question} onChange={onChange} />}
        {question.questionType === "repeatable_group" && <RepeatableGroupConfig question={question} onChange={onChange} />}

        <ValidationConfig question={question} onChange={onChange} />

        <div className="flex items-center justify-end gap-8 pt-4 border-t border-slate-50">
          <Checkbox label="Bắt buộc" checked={question.required} onChange={(v) => onChange({ required: v })} />
          <Checkbox label="Cho phép lặp" checked={question.allowRepeat} onChange={(v) => onChange({ allowRepeat: v })} />
          <button onClick={() => setShowLogic(true)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600">
            <div className="p-1.5 rounded-lg bg-slate-50">⚡ Logic</div>
          </button>
        </div>
      </div>

      {showLogic && (
        <LogicEditor 
          item={question} 
          allQuestions={allQuestions} 
          onChange={onChange} 
          onClose={() => setShowLogic(false)} 
        />
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 group/check">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <input 
          type="checkbox" 
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:border-emerald-500 checked:bg-emerald-500 transition-all" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <span className="text-[10px] font-black uppercase text-slate-400 group-hover/check:text-emerald-600">{label}</span>
    </label>
  );
}
