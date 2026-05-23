"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FormAnswerValue, FormDefinition, FormSession, FormQuestion } from "@/types/form";
import { QuestionSwitcher } from "./QuestionSwitcher";
import { useFormLogic } from "@/hooks/useFormLogic";
import { useNotificationStore } from "@/store/notification.store";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  form: FormDefinition;
  mode?: "public" | "patient" | "doctor";
  onSaveDraft?: (
    payload: { sessionId?: string; answers: FormAnswerValue[] }
  ) => Promise<FormSession | void> | void;
  onSubmit?: (
    payload: { sessionId?: string; answers: FormAnswerValue[] }
  ) => Promise<FormSession | void> | void;
  initialSessionId?: string;
};

export function FormRenderer({
  form,
  mode = "patient",
  onSaveDraft,
  onSubmit,
  initialSessionId,
}: Props) {
  const { show } = useNotificationStore();
  const logic = useFormLogic({ form, initialSessionId, onSaveDraft, onSubmit });
  const activeSection = logic.sections[logic.activeSectionIndex];

  const submit = async () => {
    if (!onSubmit) return;
    try {
      await onSubmit({ sessionId: logic.sessionId, answers: logic.flattenAnswers() });
      show({
        type: "success",
        title: "Thành công",
        message: "Biểu mẫu đã được gửi và lưu vào hệ thống.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể kết nối với máy chủ. Vui lòng thử lại sau.";
      console.error("Form submission error:", error);
      show({
        type: "error",
        title: "Lỗi gửi biểu mẫu",
        message,
      });
    }
  };

  if (!activeSection)
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-200 text-slate-500">
        Không có dữ liệu phần này.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-100 z-50">
        <motion.div
          className="h-full bg-cyan-600"
          initial={{ width: 0 }}
          animate={{ width: `${logic.progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <CardHeader
        form={form}
        mode={mode}
        saving={logic.saving}
        lastSaved={logic.lastSaved}
        onSave={() => void logic.persistDraft()}
        onSubmit={() => void submit()}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={logic.activeSectionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SectionHeader
              title={activeSection.title}
              description={activeSection.description ?? undefined}
              current={logic.activeSectionIndex + 1}
              total={logic.sections.length}
            />

            <div className="space-y-6">
              {activeSection.questions.map((q: FormQuestion) => (
                <QuestionWrapper key={q.questionId} question={q} error={logic.errors[q.questionId!]}>
                  <QuestionSwitcher
                    question={q}
                    answers={logic.answers[q.questionId!] || { 0: {} }}
                    onChange={logic.updateValue}
                    computedValues={logic.computedValues}
                  />
                </QuestionWrapper>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between pt-6 border-t border-slate-50">
          <Button
            variant="secondary"
            onClick={() => logic.setActiveSectionIndex((i) => Math.max(0, i - 1))}
            disabled={logic.activeSectionIndex === 0}
          >
            Quay lại
          </Button>

          {logic.activeSectionIndex < logic.sections.length - 1 ? (
            <Button onClick={() => logic.setActiveSectionIndex((i) => i + 1)}>Tiếp theo</Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void submit()}>
              Gửi biểu mẫu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const CardHeader = React.memo(function CardHeader({
  form,
  mode,
  saving,
  lastSaved,
  onSave,
  onSubmit,
}: {
  form: FormDefinition;
  mode: string;
  saving: boolean;
  lastSaved: Date | null;
  onSave: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap justify-between items-start gap-4">
      <div>
        <div className="flex gap-2 items-center">
          <span className="px-2 py-0.5 rounded bg-cyan-50 text-[10px] font-bold uppercase tracking-widest text-cyan-700">
            {mode}
          </span>
          {lastSaved && (
            <span className="text-[10px] text-slate-400 italic">
              Lưu tự động: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">{form.title}</h1>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu bản nháp"}
        </Button>
        <Button onClick={onSubmit}>Gửi kết quả</Button>
      </div>
    </div>
  );
});

const SectionHeader = React.memo(function SectionHeader({
  title,
  description,
  current,
  total,
}: {
  title: string;
  description?: string | null;
  current: number;
  total: number;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Phần {current} / {total}
        </p>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-slate-500 leading-relaxed">{description}</p>}
    </div>
  );
});

const QuestionWrapper = React.memo(function QuestionWrapper({
  children,
  question,
  error,
}: {
  children: React.ReactNode;
  question: FormQuestion;
  error?: string;
}) {
  return (
    <motion.div
      layout
      className={`rounded-2xl border p-5 transition-colors ${
        error
          ? "border-rose-300 bg-rose-50/20"
          : "border-slate-100 bg-slate-50/30 hover:border-slate-200"
      }`}
    >
      <p className="text-sm font-bold text-slate-800 mb-4 flex items-start gap-1">
        {question.content}
        {question.required && <span className="text-rose-500">*</span>}
      </p>
      <div className="pl-1">{children}</div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-rose-600 mt-3 flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
});
