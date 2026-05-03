"use client";

import { useState, useEffect, useMemo } from "react";
import { FormQuestion, FormOption } from "@/types/form";

interface ScoredQuestionProps {
  question: FormQuestion;
  repeatIndex: number;
  selectedOptionId?: string;
  onChange: (repeatIndex: number, value: string) => void;
  valueText?: string;
  onValueTextChange?: (repeatIndex: number, value: string) => void;
}

type ScoreCategory = {
  min: number;
  max: number;
  label: string;
  severity: string;
  color: string;
};

export function ScoredQuestion({
  question,
  repeatIndex,
  selectedOptionId,
  onChange,
}: ScoredQuestionProps) {
  const config = useMemo(() => {
    try {
      return JSON.parse(question.configJson || "{}");
    } catch {
      return {};
    }
  }, [question.configJson]);

  const categories: ScoreCategory[] = config.categories || [];

  const selectedScore = useMemo(() => {
    if (!selectedOptionId) return 0;
    const opt = question.options.find((o) => o.optionId === selectedOptionId);
    return opt?.score ?? 0;
  }, [selectedOptionId, question.options]);

  const matchedCategory = useMemo(() => {
    if (categories.length === 0) return null;
    return (
      categories.find((c) => selectedScore >= c.min && selectedScore <= c.max) || null
    );
  }, [selectedScore, categories]);

  const maxScore = useMemo(() => {
    if (categories.length > 0) {
      return Math.max(...categories.map((c) => c.max));
    }
    return Math.max(...question.options.map((o) => o.score ?? 0), 0);
  }, [categories, question.options]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">
          {question.content}
          {question.required && <span className="text-rose-500 ml-1">*</span>}
        </p>
        {matchedCategory && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              backgroundColor: `${matchedCategory.color}15`,
              color: matchedCategory.color,
              borderColor: `${matchedCategory.color}30`,
              borderWidth: 1,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: matchedCategory.color }}
            />
            <span>{matchedCategory.label}</span>
            <span className="opacity-60">({selectedScore})</span>
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = option.optionId === selectedOptionId;
          const score = option.score ?? 0;
          const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

          return (
            <button
              key={option.optionId}
              type="button"
              onClick={() => onChange(repeatIndex, option.optionId)}
              className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              {/* Score bar */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-emerald-200 transition-all"
                style={{ width: `${isSelected ? pct : 0}%` }}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {option.content}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    isSelected
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  +{score}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Legend */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <span
              key={cat.severity}
              className="text-[10px] font-medium px-2 py-1 rounded-lg"
              style={{
                backgroundColor: `${cat.color}10`,
                color: cat.color,
              }}
            >
              {cat.label} ({cat.min}-{cat.max})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
