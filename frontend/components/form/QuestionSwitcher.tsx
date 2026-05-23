"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FormQuestion } from "@/types/form";
import { ShortAnswerQuestion } from "./questions/short-answer";
import { SingleChoiceQuestion } from "./questions/single-choice";
import { MultipleChoiceQuestion } from "./questions/multiple-choice";
import { PedigreeQuestion } from "./PedigreeQuestion";
import { DEFAULT_MATRIX_SCORE_OPTIONS } from "./matrix/utils";
import type { MatrixColumn, MatrixRow } from "./matrix/types";
import { MatrixQuestion } from "./MatrixQuestion";
import { ClinicalScaleQuestion } from "./ClinicalScaleQuestion";
import { ScoredQuestion } from "./ScoredQuestion";
import { RepeatableGroupQuestion } from "./RepeatableGroupQuestion";
import { IdentityQuestion } from "./IdentityQuestion";
import { LookupQuestion } from "./LookupQuestion";
import { CalculatedDisplayQuestion } from "./CalculatedDisplayQuestion";
import { TimeSeriesTrackingQuestion } from "./TimeSeriesTrackingQuestion";

type Props = {
  question: FormQuestion;
  answers: Record<number, Record<string, unknown>>;
  onChange: (qId: string, rIdx: number, key: string, val: unknown) => void;
  computedValues?: Record<string, number | null>;
};

/** Parse valueJson một lần, cache lại */
function parseJson(raw: unknown): unknown {
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return undefined; }
  }
  return raw;
}

/** Parse configJson + triggerLogic một lần, cache lại qua question reference */
function useParsedConfig(question: FormQuestion) {
  return useMemo(() => {
    const cfg: Record<string, unknown> = {};
    if (question.configJson) {
      try { Object.assign(cfg, JSON.parse(question.configJson)); } catch { /* ignore */ }
    }
    return cfg;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.questionId, question.configJson]);
}

function parseTriggerLogic(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
}

// ─── MatrixSwitcher: tách riêng để useMemo hoạt động ổn định ────────
const MatrixSwitcher = React.memo(function MatrixSwitcher({
  question,
  valueJson,
  onChange,
}: {
  question: FormQuestion;
  valueJson: unknown;
  onChange: Props["onChange"];
}) {
  const config = useParsedConfig(question);

  const matrixRows = useMemo<MatrixRow[]>(() => {
    const configRows = Array.isArray(config.matrixRows) ? (config.matrixRows as MatrixRow[]) : [];
    const optionRows = (question.options ?? [])
      .filter((option) => parseTriggerLogic(option.triggerLogic).type === "row")
      .map((option) => ({
        rowId: option.optionId ?? crypto.randomUUID(),
        label: option.content,
        description: parseTriggerLogic(option.triggerLogic).description as string | undefined,
      }));

    return optionRows.length > 0 ? optionRows : configRows;
  }, [config.matrixRows, question.options]);

  const matrixColumns = useMemo<MatrixColumn[]>(() => {
    const configColumns = Array.isArray(config.matrixColumns) ? (config.matrixColumns as MatrixColumn[]) : [];
    const defaultMode = (config.matrixCellMode as "text" | "score" | undefined) ?? "score";
    const defaultScoreOptions = Array.isArray(config.matrixScoreOptions)
      ? config.matrixScoreOptions
      : DEFAULT_MATRIX_SCORE_OPTIONS;

    const optionColumns = (question.options ?? [])
      .filter((option) => parseTriggerLogic(option.triggerLogic).type === "column")
      .map((option) => {
        const triggerLogic = parseTriggerLogic(option.triggerLogic);
        return {
          columnId: option.optionId ?? crypto.randomUUID(),
          label: option.content,
          description: triggerLogic.description as string | undefined,
          mode: (triggerLogic.cellMode as "text" | "score" | undefined) ?? defaultMode,
          placeholder: triggerLogic.placeholder as string | undefined,
          scoreOptions: Array.isArray(triggerLogic.scoreOptions) ? (triggerLogic.scoreOptions as MatrixColumn["scoreOptions"]) : defaultScoreOptions,
        };
      });

    return optionColumns.length > 0 ? optionColumns : configColumns;
  }, [config.matrixCellMode, config.matrixColumns, config.matrixScoreOptions, question.options]);

  const handleMatrixChange = useMemo(
    () => (newValue: unknown) =>
      onChange(question.questionId as string, 0, "valueJson", JSON.stringify(newValue)),
    [onChange, question.questionId],
  );

  return (
    <MatrixQuestion
      content={question.content}
      required={question.required}
      config={{
        rows: matrixRows,
        columns: matrixColumns,
        defaultCellMode: (config.matrixCellMode as "text" | "score" | undefined) ?? "score",
        scoreOptions: Array.isArray(config.matrixScoreOptions) ? config.matrixScoreOptions : DEFAULT_MATRIX_SCORE_OPTIONS,
      }}
      value={valueJson}
      onChange={handleMatrixChange}
    />
  );
});

// ─── QuestionSwitcher chính ────────────────────────────────────────────
export const QuestionSwitcher = React.memo(function QuestionSwitcher({ question, answers, onChange, computedValues }: Props) {
  const val = answers[0] || {};
  const config = useParsedConfig(question);

  switch (question.questionType) {
    case "text":
      return (
        <ShortAnswerQuestion
          question={question}
          repeatIndex={0}
          value={String(val.valueText || "")}
          onChange={(idx, v) => onChange(question.questionId as string, idx, "valueText", v)}
        />
      );

    case "number":
      return (
        <Input
          className="rounded-xl border-slate-100 bg-white font-bold"
          type="number"
          placeholder={question.placeholder || "0"}
          value={val.valueNumber !== undefined ? String(val.valueNumber) : ""}
          onChange={(e) =>
            onChange(question.questionId as string, 0, "valueNumber", e.target.value === "" ? null : Number(e.target.value))
          }
        />
      );

    case "date":
      return (
        <Input
          className="rounded-xl border-slate-100 bg-white font-bold"
          type="date"
          value={val.valueDate ? String(val.valueDate).split("T")[0] : ""}
          onChange={(e) => onChange(question.questionId as string, 0, "valueDate", e.target.value)}
        />
      );

    case "datetime":
      return (
        <Input
          className="rounded-xl border-slate-100 bg-white font-bold"
          type="datetime-local"
          value={val.valueDatetime ? String(val.valueDatetime).substring(0, 16) : ""}
          onChange={(e) => onChange(question.questionId as string, 0, "valueDatetime", e.target.value)}
        />
      );

    case "single_choice":
      return (
        <SingleChoiceQuestion
          question={question}
          repeatIndex={0}
          selectedOptionId={val.optionId as string}
          onChange={(idx, v) => onChange(question.questionId as string, idx, "optionId", v)}
          valueText={val.valueText as string}
          onValueTextChange={(idx, v) => onChange(question.questionId as string, idx, "valueText", v)}
        />
      );

    case "multiple_choice": {
      const selectedOptionIds = parseJson(val.valueJson);
      return (
        <MultipleChoiceQuestion
          question={question}
          repeatIndex={0}
          selectedOptionIds={Array.isArray(selectedOptionIds) ? selectedOptionIds as string[] : []}
          onChange={(idx, v) => onChange(question.questionId as string, idx, "valueJson", JSON.stringify(v))}
          valueText={val.valueText as string}
          onValueTextChange={(idx, v) => onChange(question.questionId as string, idx, "valueText", v)}
        />
      );
    }

    case "matrix":
      return (
        <MatrixSwitcher
          question={question}
          valueJson={val.valueJson}
          onChange={onChange}
        />
      );

    case "pedigree":
      return (
        <PedigreeQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          value={parseJson(val.valueJson) as any}
          onChange={onChange}
        />
      );

    case "clinical_scale":
      return (
        <ClinicalScaleQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          scaleId={question.scaleId}
          config={config}
          value={parseJson(val.valueJson) as any}
          onChange={onChange}
        />
      );

    case "scored":
      return (
        <ScoredQuestion
          question={question}
          repeatIndex={0}
          selectedOptionId={val.optionId as string}
          onChange={(idx, v) => onChange(question.questionId as string, idx, "optionId", v)}
          valueText={val.valueText as string}
          onValueTextChange={(idx, v) => onChange(question.questionId as string, idx, "valueText", v)}
        />
      );

    case "repeatable_group": {
      const groupValue = parseJson(val.valueJson);
      return (
        <RepeatableGroupQuestion
          question={question}
          repeatIndex={0}
          value={Array.isArray(groupValue) ? groupValue as Record<string, unknown>[] : []}
          onChange={(idx, v) => onChange(question.questionId as string, idx, "valueJson", JSON.stringify(v))}
        />
      );
    }

    case "identity":
      return (
        <IdentityQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={config}
          value={parseJson(val.valueJson) as any}
          onChange={onChange}
        />
      );

    case "lookup":
      return (
        <LookupQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={config}
          value={parseJson(val.valueJson) as any}
          onChange={onChange}
        />
      );

    case "calculated":
      return (
        <CalculatedDisplayQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={config}
          computedValue={computedValues?.[question.questionId!] ?? null}
        />
      );

    case "time_series": {
      const tsValue = parseJson(val.valueJson);
      return (
        <TimeSeriesTrackingQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={config}
          value={Array.isArray(tsValue) ? tsValue : []}
          onChange={onChange}
        />
      );
    }

    case "file_upload":
      return (
        <div>
          <Input
            className="rounded-xl border-slate-100 bg-white font-bold"
            type="file"
            placeholder={question.placeholder || "Chọn tệp..."}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(
                  question.questionId as string,
                  0,
                  "file",
                  { name: file.name, size: file.size, type: file.type }
                );
              }
            }}
          />
          {val.valueJson ? (
            <p className="mt-1 text-xs text-slate-500">
              {typeof val.valueJson === "string"
                ? (() => { try { return JSON.parse(val.valueJson).name || val.valueJson; } catch { return val.valueJson; } })()
                : (val.valueJson as { name?: string })?.name || "Đã chọn tệp"}
            </p>
          ) : null}
        </div>
      );

    case "body_map":
      return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-400 italic">
            Tương tác với sơ đồ cơ thể để đánh dấu vị trí.
          </p>
        </div>
      );

    case "scale":
      return (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">{question.scaleMin || 0}</span>
          <input
            type="range"
            min={question.scaleMin || 0}
            max={question.scaleMax || 10}
            value={val.valueNumber !== undefined ? Number(val.valueNumber) : 0}
            onChange={(e) => onChange(question.questionId as string, 0, "valueNumber", Number(e.target.value))}
            className="flex-1 accent-emerald-500"
          />
          <span className="text-xs font-bold text-slate-400">{question.scaleMax || 10}</span>
          {val.valueNumber !== undefined && (
            <span className="ml-2 min-w-6 text-center text-sm font-black text-emerald-600">
              {Number(val.valueNumber)}
            </span>
          )}
        </div>
      );

    default:
      return (
        <Input
          className="rounded-xl border-slate-100 bg-white font-bold"
          type="text"
          placeholder={question.placeholder || "Nhập câu trả lời..."}
          value={String(val.valueText || "")}
          onChange={(e) => onChange(question.questionId as string, 0, "valueText", e.target.value)}
        />
      );
  }
});
