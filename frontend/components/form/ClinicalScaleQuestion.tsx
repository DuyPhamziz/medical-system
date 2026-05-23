"use client";

import { useState, useEffect } from "react";
import { FormQuestion } from "@/types/form";

interface ClinicalScaleQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  scaleId?: string | null;
  config?: {
    scaleName?: string;
    items?: { id: string; content: string; min: number; max: number }[];
  };
  value?: Record<string, unknown>;
  onChange: (qId: string, rIdx: number, key: string, val: unknown) => void;
}

type ScaleItemScore = { itemId: string; score: number };

export function ClinicalScaleQuestion({
  questionId,
  content,
  required,
  config,
  value,
  onChange,
}: ClinicalScaleQuestionProps) {
  const items = config?.items || [];
  const [scores, setScores] = useState<ScaleItemScore[]>(() => {
    if (value?.items) {
      return (value.items as ScaleItemScore[]) || [];
    }
    return items.map((item) => ({ itemId: item.id, score: 0 }));
  });

  // Sync from external value changes (e.g., loading a saved draft)
  useEffect(() => {
    if (value?.items && Array.isArray(value.items) && value.items.length > 0) {
      setScores((value.items as ScaleItemScore[]) || []);
    }
  }, [value?.items]);

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxScore = items.length * (items[0]?.max || 3);

  useEffect(() => {
    onChange(questionId, 0, "valueJson", JSON.stringify({ items: scores, score: totalScore }));
  }, [scores, totalScore, questionId, onChange]);

  const handleScoreChange = (itemId: string, newScore: number) => {
    setScores((prev) =>
      prev.map((s) => (s.itemId === itemId ? { ...s, score: newScore } : s))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-slate-800">
            {content}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </p>
          {config?.scaleName && (
            <span className="text-xs font-medium text-slate-400">{config.scaleName}</span>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Tổng điểm
          </span>
          <span className="text-2xl font-black text-emerald-600">
            {totalScore}
          </span>
          <span className="text-xs text-emerald-400">/ {maxScore}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const currentScore = scores.find((s) => s.itemId === item.id)?.score ?? 0;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{item.content}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 w-4 text-center">
                      {item.min}
                    </span>
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: item.max - item.min + 1 }, (_, i) => {
                        const val = item.min + i;
                        const isSelected = currentScore === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleScoreChange(item.id, val)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-105"
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 w-4 text-center">
                      {item.max}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
