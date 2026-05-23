"use client";

import { useState, useEffect, useRef } from "react";
import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function ScoredConfig({ question, onChange }: Props) {
  const config = (() => {
    try { return JSON.parse(question.configJson || "{}"); } catch { return {}; }
  })();

  const [categories, setCategories] = useState<{ id?: string; min: number; max: number; label: string; severity: string; color: string }[]>(() => {
    const raw = config.categories || [
      { min: 0, max: 4, label: "Bình thường", severity: "NORMAL", color: "green" },
      { min: 5, max: 9, label: "Nhẹ", severity: "MILD", color: "yellow" },
      { min: 10, max: 14, label: "Trung bình", severity: "MODERATE", color: "orange" },
      { min: 15, max: 27, label: "Nặng", severity: "SEVERE", color: "red" },
    ];
    // Ensure each category has a unique id for React keys
    return raw.map((c: any) => ({ ...c, id: c.id || crypto.randomUUID() }));
  });

  const lastConfigRef = useRef<string>("");

  useEffect(() => {
    const configJson = JSON.stringify({ categories });
    if (lastConfigRef.current === configJson) return;
    lastConfigRef.current = configJson;
    onChange({ configJson } as any);
  }, [categories, onChange]);

  const updateCategory = (idx: number, field: string, value: string | number) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addCategory = () => {
    const maxMin = categories.length > 0 ? categories[categories.length - 1].max + 1 : 0;
    setCategories((prev) => [
      ...prev,
      { min: maxMin, max: maxMin + 5, label: "Mức mới", severity: "UNKNOWN", color: "gray" },
    ]);
  };

  const removeCategory = (idx: number) => {
    if (categories.length <= 1) return;
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const sorted = [...categories].sort((a, b) => a.min - b.min);

  return (
    <div className="space-y-4 rounded-2xl border border-purple-100 bg-purple-50/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">
        Cấu hình thang điểm
      </p>

      <div className="space-y-2">
        {sorted.map((cat, idx) => (
          <div key={cat.id || `${cat.min}-${cat.max}-${cat.label}`} className="grid grid-cols-5 gap-2 items-center bg-white rounded-xl p-3 border border-purple-50">
            <input
              type="number"
              className="w-full rounded-lg border border-slate-100 px-2 py-1.5 text-xs font-bold text-center outline-none"
              value={cat.min}
              onChange={(e) => updateCategory(idx, "min", Number(e.target.value))}
            />
            <span className="text-center text-[10px] text-slate-400">-</span>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-100 px-2 py-1.5 text-xs font-bold text-center outline-none"
              value={cat.max}
              onChange={(e) => updateCategory(idx, "max", Number(e.target.value))}
            />
            <input
              className="rounded-lg border border-slate-100 px-2 py-1.5 text-xs font-semibold outline-none"
              value={cat.label}
              onChange={(e) => updateCategory(idx, "label", e.target.value)}
            />
            <div className="flex gap-1">
              <input
                className="flex-1 rounded-lg border border-slate-100 px-2 py-1.5 text-[10px] outline-none"
                value={cat.color}
                onChange={(e) => updateCategory(idx, "color", e.target.value)}
              />
              <button
                onClick={() => removeCategory(idx)}
                className="text-rose-300 hover:text-rose-500 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addCategory}
          className="text-[10px] font-bold text-purple-400 hover:text-purple-600"
        >
          + Thêm mức điểm
        </button>
      </div>
    </div>
  );
}
