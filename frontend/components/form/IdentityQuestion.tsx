"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FormQuestion } from "@/types/form";

interface IdentityQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    fields?: IdentityField[];
  };
  value?: Record<string, unknown>;
  onChange: (qId: string, rIdx: number, key: string, val: unknown) => void;
}

type IdentityField = {
  id: string;
  label: string;
  type: "text" | "date" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

const DEFAULT_FIELDS: IdentityField[] = [
  { id: "fullName", label: "Họ và tên", type: "text", required: true, placeholder: "Nguyễn Văn A" },
  { id: "dob", label: "Ngày sinh", type: "date", required: true },
  { id: "gender", label: "Giới tính", type: "select", required: true, options: [
    { value: "male", label: "Nam" }, { value: "female", label: "Nữ" }, { value: "other", label: "Khác" }
  ]},
  { id: "identityNumber", label: "CMND/CCCD", type: "text", placeholder: "001234567890" },
  { id: "phone", label: "Số điện thoại", type: "text", placeholder: "0912345678" },
  { id: "address", label: "Địa chỉ", type: "text", placeholder: "Số nhà, đường, phường/xã..." },
  { id: "ethnicity", label: "Dân tộc", type: "text", placeholder: "Kinh" },
  { id: "occupation", label: "Nghề nghiệp", type: "text", placeholder: "..." },
  { id: "nationality", label: "Quốc tịch", type: "text", placeholder: "Việt Nam" },
];

export function IdentityQuestion({
  questionId,
  content,
  required,
  config,
  value = {},
  onChange,
}: IdentityQuestionProps) {
  const fields = config?.fields || DEFAULT_FIELDS;

  const handleFieldChange = (fieldId: string, val: unknown) => {
    const newValue = { ...value, [fieldId]: val };
    onChange(questionId, 0, "valueJson", JSON.stringify(newValue));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-800">
        {content}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldValue = value[field.id] ?? "";
          return (
            <div key={field.id} className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {field.label}
                {field.required && <span className="text-rose-500 ml-1">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300"
                  value={String(fieldValue)}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                >
                  <option value="">-- Chọn --</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={String(fieldValue)}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="rounded-xl border-slate-100 bg-white font-semibold"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
