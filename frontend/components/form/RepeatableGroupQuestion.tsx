"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormQuestion } from "@/types/form";

interface RepeatableGroupQuestionProps {
  question: FormQuestion;
  repeatIndex: number;
  value: Record<string, unknown>[];
  onChange: (repeatIndex: number, value: Record<string, unknown>[]) => void;
}

type ChildField = {
  fieldId: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
};

export function RepeatableGroupQuestion({
  question,
  repeatIndex,
  value,
  onChange,
}: RepeatableGroupQuestionProps) {
  const config = (() => {
    try {
      return JSON.parse(question.configJson || "{}");
    } catch {
      return {};
    }
  })();

  const childFields: ChildField[] = config.childFields || [
    { fieldId: "field1", label: "Giá trị", type: "text" },
  ];
  const maxInstances = config.maxInstances || 10;
  const minInstances = config.minInstances || 1;

  const [instances, setInstances] = useState<Record<string, unknown>[]>(() => {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
    return [createEmptyInstance(childFields)];
  });

  function createEmptyInstance(fields: ChildField[]): Record<string, unknown> {
    const instance: Record<string, unknown> = {};
    fields.forEach((f) => {
      instance[f.fieldId] = "";
    });
    return instance;
  }

  const handleFieldChange = useCallback(
    (instanceIdx: number, fieldId: string, val: unknown) => {
      setInstances((prev) => {
        const next = prev.map((inst, i) =>
          i === instanceIdx ? { ...inst, [fieldId]: val } : inst
        );
        onChange(repeatIndex, next);
        return next;
      });
    },
    [repeatIndex, onChange]
  );

  const addInstance = useCallback(() => {
    if (instances.length >= maxInstances) return;
    setInstances((prev) => {
      const next = [...prev, createEmptyInstance(childFields)];
      onChange(repeatIndex, next);
      return next;
    });
  }, [instances.length, maxInstances, childFields, repeatIndex, onChange]);

  const removeInstance = useCallback(
    (idx: number) => {
      if (instances.length <= minInstances) return;
      setInstances((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        onChange(repeatIndex, next);
        return next;
      });
    },
    [instances.length, minInstances, repeatIndex, onChange]
  );

  const renderField = (field: ChildField, instanceIdx: number, instance: Record<string, unknown>) => {
    const value = instance[field.fieldId] ?? "";
    const commonProps = {
      className: "rounded-xl border-slate-100 bg-white font-bold",
      placeholder: field.label,
      value: String(value),
    };

    switch (field.type) {
      case "number":
        return (
          <Input
            type="number"
            {...commonProps}
            onChange={(e) =>
              handleFieldChange(instanceIdx, field.fieldId, e.target.value === "" ? null : Number(e.target.value))
            }
          />
        );
      case "date":
        return (
          <Input
            type="date"
            {...commonProps}
            onChange={(e) => handleFieldChange(instanceIdx, field.fieldId, e.target.value)}
          />
        );
      case "select":
        return (
          <select
            className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none"
            value={String(value)}
            onChange={(e) => handleFieldChange(instanceIdx, field.fieldId, e.target.value)}
          >
            <option value="">-- Chọn --</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            {...commonProps}
            onChange={(e) => handleFieldChange(instanceIdx, field.fieldId, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {instances.map((instance, idx) => (
        <div
          key={idx}
          className="relative rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Lần {idx + 1}
            </span>
            {instances.length > minInstances && (
              <button
                type="button"
                onClick={() => removeInstance(idx)}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
              >
                Xóa
              </button>
            )}
          </div>
          <div className="space-y-3">
            {childFields.map((field) => (
              <div key={field.fieldId}>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {field.label}
                  {field.required && <span className="text-rose-500 ml-1">*</span>}
                </label>
                {renderField(field, idx, instance)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {instances.length < maxInstances && (
        <Button
          variant="outline"
          size="sm"
          onClick={addInstance}
          className="w-full rounded-2xl border-dashed border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300"
        >
          + Thêm mục
        </Button>
      )}

      {instances.length >= maxInstances && (
        <p className="text-[10px] text-slate-400 text-center">
          Đã đạt tối đa {maxInstances} mục
        </p>
      )}
    </div>
  );
}
