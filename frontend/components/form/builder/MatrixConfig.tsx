"use client";

import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function MatrixConfig({ question, onChange }: Props) {
  const options = question.options || [];

  const updateOption = (id: string, content: string) => {
    onChange({
      options: options.map(o => o.optionId === id ? { ...o, content } : o)
    });
  };

  const addOption = (type: "row" | "column") => {
    onChange({
      options: [...options, { 
        optionId: crypto.randomUUID(), 
        content: "", 
        score: 0, 
        orderIndex: options.length, 
        triggerLogic: JSON.stringify({ type }) 
      }]
    });
  };

  const removeOption = (id: string) => {
    onChange({
      options: options.filter(o => o.optionId !== id)
    });
  };

  const rows = options.filter(o => {
    try { return JSON.parse(o.triggerLogic || "{}").type === "row"; } catch { return false; }
  });

  const columns = options.filter(o => {
    try { return JSON.parse(o.triggerLogic || "{}").type === "column"; } catch { return false; }
  });

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 p-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh sách Hàng</span>
          <button
            onClick={() => addOption("row")}
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm border border-emerald-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((opt, idx) => (
            <div key={opt.optionId} className="flex items-center gap-2">
              <input
                placeholder={`Hàng ${idx + 1}`}
                className="flex-1 bg-transparent py-1 text-sm font-bold text-slate-600 outline-none border-b border-transparent focus:border-emerald-200"
                value={opt.content}
                onChange={(e) => updateOption(opt.optionId!, e.target.value)}
              />
              <button onClick={() => removeOption(opt.optionId!)} className="text-slate-200 hover:text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 p-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Các lựa chọn trong ô</span>
          <button
            onClick={() => addOption("column")}
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm border border-emerald-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <div className="space-y-2">
          {columns.map((opt, idx) => (
            <div key={opt.optionId} className="flex items-center gap-2">
              <input
                placeholder={`Lựa chọn ${idx + 1}`}
                className="flex-1 bg-transparent py-1 text-sm font-bold text-slate-600 outline-none border-b border-transparent focus:border-emerald-200"
                value={opt.content}
                onChange={(e) => updateOption(opt.optionId!, e.target.value)}
              />
              <button onClick={() => removeOption(opt.optionId!)} className="text-slate-200 hover:text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
