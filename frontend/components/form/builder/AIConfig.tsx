"use client";

import { FormQuestion } from "@/types/form";
import { useState, useEffect } from "react";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

const INDICATORS = [
  { value: "BLOOD_PRESSURE_SYSTOLIC", label: "Huyết áp tâm thu (mmHg)" },
  { value: "BLOOD_PRESSURE_DIASTOLIC", label: "Huyết áp tâm trương (mmHg)" },
  { value: "HEART_RATE", label: "Nhịp tim (lần/phút)" },
  { value: "RESPIRATORY_RATE", label: "Nhịp thở (lần/phút)" },
  { value: "TEMPERATURE", label: "Nhiệt độ (°C)" },
  { value: "SPO2", label: "SpO2 (%)" },
  { value: "WEIGHT", label: "Cân nặng (kg)" },
  { value: "HEIGHT", label: "Chiều cao (cm)" },
  { value: "BMI", label: "Chỉ số BMI" },
  { value: "WAIST_CIRCUMFERENCE", label: "Vòng eo (cm)" },
  { value: "GLUCOSE", label: "Đường huyết (mmol/L)" },
  { value: "CHOLESTEROL", label: "Cholesterol (mmol/L)" },
  { value: "APGAR_SCORE", label: "Điểm APGAR gia đình" },
  { value: "SCREEM_SCORE", label: "Điểm SCREEM" },
];

export function AIConfig({ question, onChange }: Props) {
  const [config, setConfig] = useState<any>(() => {
    try {
      return question.aiConfigJson ? JSON.parse(question.aiConfigJson) : {};
    } catch (e) {
      return {};
    }
  });

  const updateConfig = (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange({ aiConfigJson: JSON.stringify(newConfig) });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Cấu hình AI & Lâm sàng</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gắn nhãn chỉ số</label>
          <select
            className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            value={config.indicatorCode || ""}
            onChange={(e) => updateConfig({ indicatorCode: e.target.value })}
          >
            <option value="">-- Không sử dụng cho AI --</option>
            {INDICATORS.map((indicator) => (
              <option key={indicator.value} value={indicator.value}>
                {indicator.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trọng số rủi ro (0-1)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ví dụ: 0.5"
            value={config.riskWeight || ""}
            onChange={(e) => updateConfig({ riskWeight: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quy tắc phân tầng nguy cơ (JSON)</label>
        <textarea
          className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder='{"high": 140, "medium": 120}'
          value={typeof config.thresholds === 'object' ? JSON.stringify(config.thresholds) : config.thresholds || ""}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateConfig({ thresholds: parsed });
            } catch {
              updateConfig({ thresholds: e.target.value });
            }
          }}
        />
      </div>
    </div>
  );
}
