"use client";

import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function TimeSeriesConfig({ question, onChange }: Props) {
  const options = question.options || [];

  const updateField = (id: string, updates: any) => {
    onChange({
      options: options.map(o => o.optionId === id ? { ...o, ...updates } : o)
    });
  };

  const addField = () => {
    onChange({
      options: [...options, { 
        optionId: crypto.randomUUID(), 
        content: "", 
        score: 0, 
        orderIndex: options.length, 
        triggerLogic: JSON.stringify({ type: "text" }) 
      }]
    });
  };

  const removeField = (id: string) => {
    onChange({
      options: options.filter(o => o.optionId !== id)
    });
  };

  return (
    <div className="mt-4 space-y-4 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 p-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Các trường thông tin lặp lại</span>
        <button
          onClick={addField}
          className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Thêm trường
        </button>
      </div>
      <div className="space-y-3">
        {options.map((opt, idx) => (
          <div key={opt.optionId} className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2 last:border-0">
            <input
              placeholder={`Tên trường ${idx + 1}`}
              className="flex-1 min-w-[150px] bg-transparent py-1 text-sm font-bold text-slate-600 outline-none border-b border-transparent focus:border-emerald-200"
              value={opt.content}
              onChange={(e) => updateField(opt.optionId!, { content: e.target.value })}
            />
            <select 
              className="rounded-lg bg-white border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 outline-none"
              value={(() => { try { return JSON.parse(opt.triggerLogic || "{}").type || "text"; } catch { return "text"; } })()}
              onChange={(e) => updateField(opt.optionId!, { triggerLogic: JSON.stringify({ type: e.target.value }) })}
            >
              <option value="text">Văn bản</option>
              <option value="number">Số</option>
              <option value="date">Ngày</option>
            </select>
            <button onClick={() => removeField(opt.optionId!)} className="text-slate-200 hover:text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
