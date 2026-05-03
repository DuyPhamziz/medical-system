"use client";

import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (updates: Partial<FormQuestion>) => void;
};

export function ValidationConfig({ question, onChange }: Props) {
  const { questionType } = question;

  const renderTextValidation = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Độ dài tối thiểu</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.minLength ?? ""}
          onChange={(e) => onChange({ minLength: e.target.value === "" ? null : parseInt(e.target.value) })}
          placeholder="VD: 10"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Độ dài tối đa</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.maxLength ?? ""}
          onChange={(e) => onChange({ maxLength: e.target.value === "" ? null : parseInt(e.target.value) })}
          placeholder="VD: 255"
        />
      </div>
      <div className="col-span-2 space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Định dạng (Regex)</label>
        <input
          type="text"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.validationPattern ?? ""}
          onChange={(e) => onChange({ validationPattern: e.target.value })}
          placeholder="VD: ^[a-zA-Z0-9]+$"
        />
      </div>
      <div className="col-span-2 space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thông báo lỗi</label>
        <input
          type="text"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.validationMessage ?? ""}
          onChange={(e) => onChange({ validationMessage: e.target.value })}
          placeholder="VD: Định dạng không hợp lệ"
        />
      </div>
    </div>
  );

  const renderNumberValidation = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá trị tối thiểu</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.minValue ?? ""}
          onChange={(e) => onChange({ minValue: e.target.value === "" ? null : parseFloat(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá trị tối đa</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.maxValue ?? ""}
          onChange={(e) => onChange({ maxValue: e.target.value === "" ? null : parseFloat(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số chữ số tối thiểu</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.minLength ?? ""}
          onChange={(e) => onChange({ minLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số chữ số tối đa</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.maxLength ?? ""}
          onChange={(e) => onChange({ maxLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
    </div>
  );

  const renderDateValidation = () => {
    const config = JSON.parse(question.configJson || "{}");
    const updateConfig = (updates: any) => {
      onChange({ configJson: JSON.stringify({ ...config, ...updates }) });
    };

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày tối thiểu</label>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
            value={config.minDate ?? ""}
            onChange={(e) => updateConfig({ minDate: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày tối đa</label>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
            value={config.maxDate ?? ""}
            onChange={(e) => updateConfig({ maxDate: e.target.value || null })}
          />
        </div>
      </div>
    );
  };

  const renderMultipleChoiceValidation = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn tối thiểu</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.minLength ?? ""}
          onChange={(e) => onChange({ minLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn tối đa</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.maxLength ?? ""}
          onChange={(e) => onChange({ maxLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
    </div>
  );

  const renderFileUploadValidation = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số file tối thiểu</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.minLength ?? ""}
          onChange={(e) => onChange({ minLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số file tối đa</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.maxLength ?? ""}
          onChange={(e) => onChange({ maxLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
    </div>
  );

  const renderScaleConfig = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá trị nhỏ nhất</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.scaleMin ?? 0}
          onChange={(e) => onChange({ scaleMin: parseInt(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá trị lớn nhất</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.scaleMax ?? 10}
          onChange={(e) => onChange({ scaleMax: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );

  const renderTimeSeriesValidation = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số lượng bản ghi tối thiểu</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.minLength ?? ""}
          onChange={(e) => onChange({ minLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số lượng bản ghi tối đa</label>
        <input
          type="number"
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
          value={question.maxLength ?? ""}
          onChange={(e) => onChange({ maxLength: e.target.value === "" ? null : parseInt(e.target.value) })}
        />
      </div>
    </div>
  );

  return (
    <div className="mt-4 space-y-4 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 p-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ràng buộc & Xác thực</span>
      </div>

      {questionType === "text" && renderTextValidation()}
      {questionType === "number" && renderNumberValidation()}
      {(questionType === "date" || questionType === "datetime") && renderDateValidation()}
      {questionType === "multiple_choice" && renderMultipleChoiceValidation()}
      {questionType === "file_upload" && renderFileUploadValidation()}
      {questionType === "time_series" && renderTimeSeriesValidation()}
      {questionType === "scale" && renderScaleConfig()}
      
      {/* Fallback or generic validation message for others */}
      {!["text", "number", "date", "datetime", "multiple_choice", "file_upload", "time_series", "scale"].includes(questionType) && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thông báo lỗi tùy chỉnh</label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white"
            value={question.validationMessage ?? ""}
            onChange={(e) => onChange({ validationMessage: e.target.value })}
            placeholder="Thông báo khi không thỏa mãn điều kiện"
          />
        </div>
      )}
    </div>
  );
}
