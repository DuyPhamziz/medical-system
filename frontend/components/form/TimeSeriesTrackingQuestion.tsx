"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormQuestion } from "@/types/form";

interface TimeSeriesTrackingQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    measurementLabel?: string;
    unit?: string;
    maxPoints?: number;
    showChart?: boolean;
  };
  value?: Record<string, unknown>[];
  onChange: (qId: string, rIdx: number, key: string, val: unknown) => void;
}

type TimePoint = {
  timestamp: string;
  value: number;
  label?: string;
  note?: string;
};

export function TimeSeriesTrackingQuestion({
  questionId,
  content,
  required,
  config,
  value = [],
  onChange,
}: TimeSeriesTrackingQuestionProps) {
  const measurementLabel = config?.measurementLabel || "Giá trị";
  const unit = config?.unit || "";
  const maxPoints = config?.maxPoints || 20;
  const showChart = config?.showChart ?? true;

  const [points, setPoints] = useState<TimePoint[]>(() => {
    if (Array.isArray(value) && value.length > 0) {
      return value as TimePoint[];
    }
    return [];
  });

  const [newTimestamp, setNewTimestamp] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [newValue, setNewValue] = useState("");
  const [newNote, setNewNote] = useState("");

  const syncToParent = useCallback(
    (updatedPoints: TimePoint[]) => {
      onChange(questionId, 0, "valueJson", JSON.stringify(updatedPoints));
    },
    [questionId, onChange]
  );

  const addPoint = useCallback(() => {
    if (!newValue || points.length >= maxPoints) return;
    const point: TimePoint = {
      timestamp: new Date(newTimestamp).toISOString(),
      value: Number(newValue),
      note: newNote || undefined,
    };
    const updated = [...points, point].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    setPoints(updated);
    syncToParent(updated);
    setNewValue("");
    setNewNote("");
  }, [newValue, newTimestamp, newNote, points, maxPoints, syncToParent]);

  const removePoint = useCallback(
    (idx: number) => {
      const updated = points.filter((_, i) => i !== idx);
      setPoints(updated);
      syncToParent(updated);
    },
    [points, syncToParent]
  );

  // Chart dimensions
  const chartData = useMemo(() => {
    if (points.length < 2) return null;
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = range * 0.15;
    return { min: min - padding, max: max + padding, range: range + 2 * padding };
  }, [points]);

  const chartWidth = 500;
  const chartHeight = 180;

  const pointToPixel = (val: number, idx: number) => {
    if (!chartData || points.length < 2) return { x: 0, y: 0 };
    const x = (idx / (points.length - 1)) * (chartWidth - 40) + 20;
    const y =
      chartHeight -
      20 -
      ((val - chartData.min) / chartData.range) * (chartHeight - 40);
    return { x, y };
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-800">
        {content} {required && <span className="text-rose-500">*</span>}
      </p>

      {/* Chart */}
      {showChart && points.length >= 2 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = chartHeight - 20 - frac * (chartHeight - 40);
              const val = chartData!.min + frac * chartData!.range;
              return (
                <g key={frac}>
                  <line
                    x1={20}
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                  <text
                    x={18}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-300 font-medium"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Line */}
            <polyline
              points={points
                .map((p, i) => {
                  const pt = pointToPixel(p.value, i);
                  return `${pt.x},${pt.y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Points */}
            {points.map((p, i) => {
              const pt = pointToPixel(p.value, i);
              return (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    fill="white"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <title>{`${p.label || `Lần ${i + 1}`}: ${p.value}${unit} (${new Date(p.timestamp).toLocaleDateString()})`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Data table */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        {points.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {points.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/50 transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400">
                  {idx + 1}
                </span>
                <span className="flex-1 text-xs font-semibold text-slate-600">
                  {new Date(p.timestamp).toLocaleDateString("vi-VN")}
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {p.value}
                  {unit && <span className="text-[10px] font-medium text-slate-400 ml-0.5">{unit}</span>}
                </span>
                {p.note && (
                  <span className="text-[10px] text-slate-400 italic max-w-[120px] truncate">
                    {p.note}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePoint(idx)}
                  className="text-rose-300 hover:text-rose-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-400">
              Chưa có dữ liệu. Thêm điểm đo đầu tiên bên dưới.
            </p>
          </div>
        )}
      </div>

      {/* Add new point */}
      {points.length < maxPoints && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Thêm điểm đo mới
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-medium text-slate-400 mb-1">
                Thời gian
              </label>
              <Input
                type="datetime-local"
                value={newTimestamp}
                onChange={(e) => setNewTimestamp(e.target.value)}
                className="rounded-xl border-slate-100 bg-white text-sm"
              />
            </div>
            <div className="w-24">
              <label className="block text-[10px] font-medium text-slate-400 mb-1">
                {measurementLabel}
              </label>
              <Input
                type="number"
                placeholder="0"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="rounded-xl border-slate-100 bg-white text-sm font-bold"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] font-medium text-slate-400 mb-1">
                Ghi chú
              </label>
              <Input
                placeholder="..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="rounded-xl border-slate-100 bg-white text-sm"
              />
            </div>
            <Button
              onClick={addPoint}
              disabled={!newValue}
              size="sm"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4"
            >
              + Thêm
            </Button>
          </div>
        </div>
      )}

      {points.length >= maxPoints && (
        <p className="text-[10px] text-slate-400 text-center">
          Đã đạt tối đa {maxPoints} điểm đo
        </p>
      )}
    </div>
  );
}
