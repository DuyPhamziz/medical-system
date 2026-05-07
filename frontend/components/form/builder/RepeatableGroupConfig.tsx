"use client";

import { useState, useEffect } from "react";
import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

type ChildField = {
  fieldId: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required: boolean;
};

export function RepeatableGroupConfig({ question, onChange }: Props) {
  const config = (() => {
    try { return JSON.parse(question.configJson || "{}"); } catch { return {}; }
  })();

  const [maxInstances, setMaxInstances] = useState(config.maxInstances || 10);
  const [minInstances, setMinInstances] = useState(config.minInstances || 1);
  const [childFields, setChildFields] = useState<ChildField[]>(
    config.childFields || [
      { fieldId: "field1", label: "Tên", type: "text", required: true },
      { fieldId: "field2", label: "Giá trị", type: "text", required: false },
    ]
  );

  useEffect(() => {
    const configJson = JSON.stringify({
      maxInstances,
      minInstances,
      childFields,
    });
    
    if (question.configJson !== configJson) {
      onChange({ configJson } as any);
    }
  }, [maxInstances, minInstances, childFields, question.configJson, onChange]);

  const addField = () => {
    setChildFields((prev) => [
      ...prev,
      { fieldId: `field${prev.length + 1}`, label: `Trường ${prev.length + 1}`, type: "text", required: false },
    ]);
  };

  const removeField = (idx: number) => {
    if (childFields.length <= 1) return;
    setChildFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, field: string, value: string | boolean) => {
    setChildFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
        Cấu hình nhóm lặp
      </p>

      <div className="flex gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500">Tối thiểu</label>
          <input
            type="number"
            className="mt-1 w-20 rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm font-bold outline-none"
            value={minInstances}
            min={1}
            onChange={(e) => setMinInstances(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500">Tối đa</label>
          <input
            type="number"
            className="mt-1 w-20 rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm font-bold outline-none"
            value={maxInstances}
            min={1}
            onChange={(e) => setMaxInstances(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase">Các trường con</p>
        {childFields.map((field, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-white rounded-xl p-3 border border-amber-50">
            <input
              className="flex-1 rounded-lg border border-slate-100 px-3 py-1.5 text-xs font-semibold outline-none"
              placeholder="Tên trường"
              value={field.label}
              onChange={(e) => updateField(idx, "label", e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-100 px-2 py-1.5 text-xs font-bold outline-none"
              value={field.type}
              onChange={(e) => updateField(idx, "type", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="number">Số</option>
              <option value="date">Ngày</option>
              <option value="select">Chọn</option>
            </select>
            <label className="flex items-center gap-1 text-[10px] text-slate-400">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(idx, "required", e.target.checked)}
                className="rounded"
              />
              Bắt buộc
            </label>
            <button
              onClick={() => removeField(idx)}
              className="text-rose-300 hover:text-rose-500 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addField}
          className="text-[10px] font-bold text-amber-400 hover:text-amber-600"
        >
          + Thêm trường
        </button>
      </div>
    </div>
  );
}
