"use client";

import { FormQuestion } from "@/types/form";

interface CalculatedDisplayQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    formula?: string;
    unit?: string;
    decimalPlaces?: number;
    fieldName?: string;
  };
  computedValue?: number | null;
}

export function CalculatedDisplayQuestion({
  questionId,
  content,
  required,
  config,
  computedValue,
}: CalculatedDisplayQuestionProps) {
  const formula = config?.formula || "";
  const unit = config?.unit || "";
  const decimals = config?.decimalPlaces ?? 2;
  const displayValue = computedValue != null ? computedValue.toFixed(decimals) : "—";

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">
        {content}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </p>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-black text-emerald-700 tracking-tight">
              {displayValue}
              {unit && (
                <span className="text-lg font-bold text-emerald-400 ml-1">
                  {unit}
                </span>
              )}
            </div>
          </div>
          {formula && (
            <div className="hidden sm:block px-3 py-2 rounded-xl bg-white border border-emerald-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Công thức
              </p>
              <p className="text-xs font-mono font-semibold text-slate-600">
                {formula}
              </p>
            </div>
          )}
        </div>

        {computedValue == null && (
          <p className="mt-2 text-xs text-slate-400 italic">
            Kết quả sẽ được tính tự động khi bạn điền đầy đủ các trường liên quan.
          </p>
        )}
      </div>
    </div>
  );
}
