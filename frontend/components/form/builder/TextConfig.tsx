"use client";

import { useState, useEffect } from "react";
import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function TextConfig({ question, onChange }: Props) {
  const config = (() => {
    try { return JSON.parse(question.configJson || "{}"); } catch { return {}; }
  })();

  const [textMode, setTextMode] = useState<"SHORT" | "PARAGRAPH">(
    config.textMode || "SHORT"
  );

  useEffect(() => {
    const configJson = JSON.stringify({ textMode });
    onChange({ configJson } as any);
  }, [textMode]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
        Kiểu nhập liệu
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTextMode("SHORT")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            textMode === "SHORT"
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-white text-slate-400 border border-slate-100 hover:border-slate-200"
          }`}
        >
          Văn bản ngắn (1 dòng)
        </button>
        <button
          type="button"
          onClick={() => setTextMode("PARAGRAPH")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            textMode === "PARAGRAPH"
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-white text-slate-400 border border-slate-100 hover:border-slate-200"
          }`}
        >
          Đoạn văn (nhiều dòng)
        </button>
      </div>
    </div>
  );
}
