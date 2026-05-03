"use client";

import { Input } from "@/components/ui/input";
import { FormQuestion } from "@/types/form";
import { ShortAnswerQuestion } from "./questions/short-answer";
import { SingleChoiceQuestion } from "./questions/single-choice";
import { MultipleChoiceQuestion } from "./questions/multiple-choice";
import { PedigreeQuestion } from "./PedigreeQuestion";
import { MatrixQuestion, DynamicColumn } from "./MatrixQuestion";
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
};

export function QuestionSwitcher({ question, answers, onChange }: Props) {
  const val = answers[0] || {};

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
      const selectedOptionIds = (() => {
        try {
          const parsed = typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : val.valueJson;
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      return (
        <MultipleChoiceQuestion
          question={question}
          repeatIndex={0}
          selectedOptionIds={selectedOptionIds}
          onChange={(idx, v) => onChange(question.questionId as string, idx, "valueJson", JSON.stringify(v))}
          valueText={val.valueText as string}
          onValueTextChange={(idx, v) => onChange(question.questionId as string, idx, "valueText", v)}
        />
      );
    }

    case "matrix": {
      let config: any = {};
      if (question.configJson) {
        try {
          config = JSON.parse(question.configJson);
        } catch (e) {
          console.error("Invalid matrix config", e);
        }
      }
      const matrixCellOptions = question.options
        ?.filter((o) => {
          try {
            return JSON.parse(o.triggerLogic || "{}").type === "column";
          } catch {
            return false;
          }
        })
        .map((opt) => ({ optionId: opt.optionId!, label: opt.content }));
      const matrixValue: DynamicColumn[] = (() => {
        try {
          const parsed = typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : val.valueJson;
          return Array.isArray(parsed) ? (parsed as DynamicColumn[]) : [];
        } catch {
          return [];
        }
      })();
      return (
        <MatrixQuestion
          content={question.content}
          required={question.required}
          config={{ rows: config.matrixRows || [], options: matrixCellOptions || [] }}
          value={matrixValue}
          onChange={(newValue) => onChange(question.questionId as string, 0, "valueJson", JSON.stringify(newValue))}
        />
      );
    }

    case "pedigree":
      return (
        <PedigreeQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          value={typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : undefined}
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
          config={(question as any).configJson ? JSON.parse((question as any).configJson) : undefined}
          value={typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : undefined}
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
      const groupValue = (() => {
        try {
          const parsed = typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : val.valueJson;
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      return (
        <RepeatableGroupQuestion
          question={question}
          repeatIndex={0}
          value={groupValue}
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
          config={(question as any).configJson ? JSON.parse((question as any).configJson) : undefined}
          value={typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : undefined}
          onChange={onChange}
        />
      );

    case "lookup":
      return (
        <LookupQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={(question as any).configJson ? JSON.parse((question as any).configJson) : undefined}
          value={typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : undefined}
          onChange={onChange}
        />
      );

    case "calculated":
      return (
        <CalculatedDisplayQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={(question as any).configJson ? JSON.parse((question as any).configJson) : undefined}
        />
      );

    case "time_series": {
      const tsValue = (() => {
        try {
          const parsed = typeof val.valueJson === "string" ? JSON.parse(val.valueJson) : val.valueJson;
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      return (
        <TimeSeriesTrackingQuestion
          questionId={question.questionId as string}
          content={question.content}
          required={question.required}
          config={(question as any).configJson ? JSON.parse((question as any).configJson) : undefined}
          value={tsValue}
          onChange={onChange}
        />
      );
    }

    case "file_upload":
      return (
        <Input
          className="rounded-xl border-slate-100 bg-white font-bold"
          type="file"
          placeholder={question.placeholder || "Chọn tệp..."}
        />
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
            <span className="ml-2 text-sm font-black text-emerald-600 min-w-[24px] text-center">
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
}
