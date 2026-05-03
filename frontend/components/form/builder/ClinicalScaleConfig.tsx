"use client";

import { useState, useEffect } from "react";
import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function ClinicalScaleConfig({ question, onChange }: Props) {
  const config = (() => {
    try { return JSON.parse(question.configJson || "{}"); } catch { return {}; }
  })();

  const [scaleName, setScaleName] = useState(config.scaleName || "");
  const [items, setItems] = useState<{ id: string; content: string; min: number; max: number }[]>(
    config.items || [
      { id: "q1", content: "Câu hỏi 1", min: 0, max: 3 },
      { id: "q2", content: "Câu hỏi 2", min: 0, max: 3 },
    ]
  );

  useEffect(() => {
    const configJson = JSON.stringify({ scaleName, items });
    onChange({ configJson } as any);
  }, [scaleName, items]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `q${prev.length + 1}`, content: `Câu hỏi ${prev.length + 1}`, min: 0, max: 3 },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
        Cấu hình thang điểm lâm sàng
      </p>

      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase">
          Tên thang điểm
        </label>
        <input
          className="w-full mt-1 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-bold outline-none"
          placeholder="PHQ-9, GAD-7..."
          value={scaleName}
          onChange={(e) => setScaleName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-white rounded-xl p-3 border border-blue-50">
            <span className="text-[10px] font-bold text-slate-400 w-4">{idx + 1}</span>
            <input
              className="flex-1 rounded-lg border border-slate-100 px-3 py-1.5 text-xs font-semibold outline-none"
              placeholder="Nội dung"
              value={item.content}
              onChange={(e) => updateItem(idx, "content", e.target.value)}
            />
            <input
              type="number"
              className="w-14 rounded-lg border border-slate-100 px-2 py-1.5 text-xs font-bold text-center outline-none"
              value={item.min}
              onChange={(e) => updateItem(idx, "min", Number(e.target.value))}
            />
            <span className="text-[10px] text-slate-400">-</span>
            <input
              type="number"
              className="w-14 rounded-lg border border-slate-100 px-2 py-1.5 text-xs font-bold text-center outline-none"
              value={item.max}
              onChange={(e) => updateItem(idx, "max", Number(e.target.value))}
            />
            <button
              onClick={() => removeItem(idx)}
              className="text-rose-300 hover:text-rose-500 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="text-[10px] font-bold text-blue-400 hover:text-blue-600"
        >
          + Thêm mục
        </button>
      </div>
    </div>
  );
}
