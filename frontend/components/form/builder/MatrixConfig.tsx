"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_MATRIX_SCORE_OPTIONS,
} from "../matrix/utils";
import type {
  MatrixCellMode,
  MatrixColumn,
  MatrixRow,
  MatrixScoreOption,
} from "../matrix/types";
import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

type MatrixConfigState = {
  matrixRows: MatrixRow[];
  matrixColumns: MatrixColumn[];
  matrixCellMode: MatrixCellMode;
  matrixScoreOptions: MatrixScoreOption[];
};

function safeParseConfig(raw: string | null | undefined): Partial<MatrixConfigState> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeScoreOptions(input?: MatrixScoreOption[]): MatrixScoreOption[] {
  const source = Array.isArray(input) && input.length > 0 ? input : DEFAULT_MATRIX_SCORE_OPTIONS;
  return source.map((option, index) => ({
    value: String(option.value ?? index + 1),
    label: option.label || DEFAULT_MATRIX_SCORE_OPTIONS[index]?.label || `Mức ${index + 1}`,
    score: Number.isFinite(option.score) ? option.score : index + 1,
  }));
}

function makeRow(index: number): MatrixRow {
  return {
    rowId: crypto.randomUUID(),
    label: `Hàng ${index + 1}`,
    description: "",
  };
}

function makeColumn(index: number, defaultMode: MatrixCellMode): MatrixColumn {
  return {
    columnId: crypto.randomUUID(),
    label: `Cột ${index + 1}`,
    description: "",
    mode: defaultMode,
    placeholder: defaultMode === "text" ? "Nhập câu trả lời ngắn" : "",
    scoreOptions: normalizeScoreOptions(DEFAULT_MATRIX_SCORE_OPTIONS),
  };
}

export function MatrixConfig({ question, onChange }: Props) {
  const initialConfig = useMemo(() => safeParseConfig(question.configJson), [question.configJson]);

  const [rows, setRows] = useState<MatrixRow[]>(() => initialConfig.matrixRows ?? []);
  const [columns, setColumns] = useState<MatrixColumn[]>(() => initialConfig.matrixColumns ?? []);
  const [defaultCellMode, setDefaultCellMode] = useState<MatrixCellMode>(
    (initialConfig.matrixCellMode as MatrixCellMode | undefined) ?? "score",
  );
  const [scoreOptions, setScoreOptions] = useState<MatrixScoreOption[]>(() =>
    normalizeScoreOptions(initialConfig.matrixScoreOptions),
  );

  const lastJsonRef = useRef<string>(question.configJson || "");

  useEffect(() => {
    setRows(initialConfig.matrixRows ?? []);
    setColumns(initialConfig.matrixColumns ?? []);
    setDefaultCellMode((initialConfig.matrixCellMode as MatrixCellMode | undefined) ?? "score");
    setScoreOptions(normalizeScoreOptions(initialConfig.matrixScoreOptions));
  }, [initialConfig]);

  useEffect(() => {
    const nextConfig: MatrixConfigState = {
      matrixRows: rows,
      matrixColumns: columns,
      matrixCellMode: defaultCellMode,
      matrixScoreOptions: scoreOptions,
    };
    const nextJson = JSON.stringify(nextConfig);

    if (lastJsonRef.current === nextJson) {
      return;
    }

    lastJsonRef.current = nextJson;
    onChange({ configJson: nextJson } as any);
  }, [columns, defaultCellMode, onChange, rows, scoreOptions]);

  const addRow = () => setRows((prev) => [...prev, makeRow(prev.length)]);
  const addColumn = () => setColumns((prev) => [...prev, makeColumn(prev.length, defaultCellMode)]);

  const updateRow = (index: number, updates: Partial<MatrixRow>) => {
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...updates } : row)));
  };

  const updateColumn = (index: number, updates: Partial<MatrixColumn>) => {
    setColumns((prev) => prev.map((column, columnIndex) => (columnIndex === index ? { ...column, ...updates } : column)));
  };

  const updateScoreOption = (index: number, updates: Partial<MatrixScoreOption>) => {
    setScoreOptions((prev) => prev.map((option, optionIndex) => (optionIndex === index ? { ...option, ...updates } : option)));
  };

  return (
    <div className="mt-4 space-y-4 rounded-3xl border border-slate-50 bg-slate-50/30 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cấu hình ma trận</span>
          <p className="mt-1 text-xs text-slate-500">Chủ động tạo hàng, cột và chọn ô trả lời ngắn hoặc ô chấm điểm.</p>
        </div>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-50 hover:bg-emerald-50 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Thêm cột
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hàng</span>
            <button
              type="button"
              onClick={addRow}
              className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700"
            >
              + Thêm hàng
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Chưa có hàng nào.</div>
            ) : null}
            {rows.map((row, index) => (
              <div key={row.rowId} className="space-y-2 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-300"
                    placeholder={`Hàng ${index + 1}`}
                    value={row.label}
                    onChange={(event) => updateRow(index, { label: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                    className="rounded-lg px-2 py-2 text-slate-300 hover:text-rose-500"
                    aria-label="Xóa hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <input
                  className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                  placeholder="Mô tả hàng (tùy chọn)"
                  value={row.description ?? ""}
                  onChange={(event) => updateRow(index, { description: event.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cột</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Mặc định</span>
              <select
                className="rounded-lg border border-slate-100 bg-white px-2 py-1 text-xs font-bold text-slate-600 outline-none"
                value={defaultCellMode}
                onChange={(event) => setDefaultCellMode(event.target.value as MatrixCellMode)}
              >
                <option value="score">Chấm điểm</option>
                <option value="text">Trả lời ngắn</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {columns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Chưa có cột nào.</div>
            ) : null}
            {columns.map((column, index) => (
              <div key={column.columnId} className="space-y-3 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-300"
                    placeholder={`Cột ${index + 1}`}
                    value={column.label}
                    onChange={(event) => updateColumn(index, { label: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.filter((_, columnIndex) => columnIndex !== index))}
                    className="rounded-lg px-2 py-2 text-slate-300 hover:text-rose-500"
                    aria-label="Xóa cột"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>

                <input
                  className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                  placeholder="Mô tả cột (tùy chọn)"
                  value={column.description ?? ""}
                  onChange={(event) => updateColumn(index, { description: event.target.value })}
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-bold text-slate-500">
                    Kiểu ô
                    <select
                      className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-semibold outline-none"
                      value={column.mode ?? defaultCellMode}
                      onChange={(event) => updateColumn(index, { mode: event.target.value as MatrixCellMode })}
                    >
                      <option value="score">Chấm điểm</option>
                      <option value="text">Trả lời ngắn</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-bold text-slate-500">
                    Placeholder
                    <input
                      className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm outline-none"
                      placeholder="Nhập câu trả lời ngắn"
                      value={column.placeholder ?? ""}
                      onChange={(event) => updateColumn(index, { placeholder: event.target.value })}
                      disabled={(column.mode ?? defaultCellMode) !== "text"}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">3 mức điểm</span>
          <button
            type="button"
            onClick={() => setScoreOptions((prev) => [...prev, { value: String(prev.length + 1), label: `Mức ${prev.length + 1}`, score: prev.length + 1 }])}
            className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700"
          >
            + Thêm mức
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {scoreOptions.map((option, index) => (
            <div key={`${option.value}-${index}`} className="rounded-xl border border-slate-100 p-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Nhãn</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold outline-none"
                value={option.label}
                onChange={(event) => updateScoreOption(index, { label: event.target.value })}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs font-bold text-slate-500">
                  Giá trị
                  <input
                    className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm outline-none"
                    value={option.value}
                    onChange={(event) => updateScoreOption(index, { value: event.target.value })}
                  />
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-500">
                  Điểm
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm outline-none"
                    value={option.score}
                    onChange={(event) => updateScoreOption(index, { score: Number(event.target.value) })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}