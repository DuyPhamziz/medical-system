"use client";

import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function ChoiceConfig({ question, onChange }: Props) {
  const options = question.options || [];

  const updateOption = (idx: number, content: string) => {
    const next = [...options];
    next[idx] = { ...next[idx], content };
    // Ensure all orderIndices are correct
    const finalized = next.map((opt, i) => ({ ...opt, orderIndex: i }));
    onChange({ options: finalized });
  };

  const addOption = (afterIdx?: number) => {
    const next = [...options];
    const newOpt = {
      optionId: crypto.randomUUID(),
      content: "",
      score: 0,
      orderIndex: 0 // Will be set below
    };
    
    if (afterIdx !== undefined) {
      next.splice(afterIdx + 1, 0, newOpt);
    } else {
      next.push(newOpt);
    }
    
    // Recalculate all order indices
    const finalized = next.map((opt, i) => ({ ...opt, orderIndex: i }));
    onChange({ options: finalized });
  };

  const removeOption = (idx: number) => {
    const next = options.filter((_, i) => i !== idx);
    // Recalculate all order indices
    const finalized = next.map((opt, i) => ({ ...opt, orderIndex: i }));
    onChange({ options: finalized });
  };

  return (
    <div className="mt-4 space-y-4 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 p-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh sách lựa chọn</span>
        <button
          onClick={() => addOption()}
          className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-50 hover:bg-emerald-50 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Thêm lựa chọn
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option, idx) => (
          <div key={option.optionId} className="group/option flex items-center gap-4">
            <div className={`flex h-5 w-5 items-center justify-center border-2 border-slate-200 transition-all ${question.questionType === 'single_choice' ? 'rounded-full' : 'rounded-md'}`}>
              <div className={`h-2 w-2 bg-emerald-500 opacity-0 group-focus-within/option:opacity-100 transition-opacity ${question.questionType === 'single_choice' ? 'rounded-full' : 'rounded-sm'}`} />
            </div>
            <input
              placeholder={`Lựa chọn ${idx + 1}`}
              className="flex-1 bg-transparent py-1 text-sm font-bold text-slate-600 outline-none border-b border-transparent focus:border-emerald-200 transition-all"
              value={option.content}
              onChange={(e) => updateOption(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption(idx);
                }
              }}
            />
            <button 
              onClick={() => removeOption(idx)}
              className="p-1 text-slate-200 hover:text-rose-500 opacity-0 group-hover/option:opacity-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <label className="flex cursor-pointer items-center gap-3 group/check">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <input 
              type="checkbox" 
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:border-emerald-500 checked:bg-emerald-500 transition-all" 
              checked={question.allowOther || false} 
              onChange={(e) => onChange({ allowOther: e.target.checked })} 
            />
            <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 group-hover/check:text-emerald-600">Cho phép nhập đáp án khác</span>
        </label>
      </div>
    </div>
  );
}
