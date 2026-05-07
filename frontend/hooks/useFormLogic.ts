import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FormDefinition, FormSession, AnswersState, FormAnswerValue } from "@/types/form";
import { useNotificationStore } from "@/store/notification.store";
import { flattenAnswersToPayload } from "@/utils/form-logic-utils";
import { useFormVisibility } from "./useFormVisibility";
import { useFormComputedValues } from "./useFormComputedValues";

type UseFormLogicProps = {
  form: FormDefinition;
  initialSessionId?: string;
  onSaveDraft?: (payload: { sessionId?: string; answers: FormAnswerValue[] }) => Promise<FormSession | void> | void;
  onSubmit?: (payload: { sessionId?: string; answers: FormAnswerValue[] }) => Promise<FormSession | void> | void;
  useServerLogic?: boolean;
};

export function useFormLogic({ form, initialSessionId, onSaveDraft, useServerLogic = true }: UseFormLogicProps) {
  const { show } = useNotificationStore();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const computedValues = useFormComputedValues(form, answers);
  const { visibleSections } = useFormVisibility(form, answers, useServerLogic);

  const progress = useMemo(() => 
    (visibleSections.length === 0 ? 0 : Math.round(((activeSectionIndex + 1) / visibleSections.length) * 100)), 
    [activeSectionIndex, visibleSections.length]
  );

  const persistDraft = useCallback(async (isAuto = false) => {
    if (!onSaveDraft || saving) return;
    setSaving(true);
    try {
      const payload = flattenAnswersToPayload(answers);
      const saved = await onSaveDraft({ sessionId, answers: payload });
      if (saved && typeof saved === "object" && "sessionId" in saved) setSessionId(saved.sessionId);
      setLastSaved(new Date());
      if (!isAuto) {
        show({ type: 'success', title: 'Đã lưu bản nháp', message: 'Tiến trình của bạn đã được lưu lại thành công.' });
      }
    } catch {
      if (!isAuto) {
        show({ type: 'error', title: 'Lỗi lưu bản nháp', message: 'Không thể lưu bản nháp lúc này. Vui lòng kiểm tra kết nối.' });
      }
    } finally { setSaving(false); }
  }, [onSaveDraft, saving, sessionId, answers, show]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void persistDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [persistDraft]);

  const updateValue = useCallback((qId: string, rIdx: number, key: string, val: unknown) => {
    setAnswers(prev => {
      const prevRepeat = prev[qId]?.[rIdx] ?? {};
      if (prevRepeat[key] === val) return prev;
      return { 
        ...prev, 
        [qId]: { ...prev[qId], [rIdx]: { ...prevRepeat, [key]: val as string | number | boolean | null } } 
      };
    });
  }, []);

  return {
    activeSectionIndex, 
    setActiveSectionIndex, 
    sections: visibleSections, 
    progress,
    answers, 
    setAnswers, 
    computedValues, 
    saving, 
    errors, 
    setErrors, 
    lastSaved,
    updateValue, 
    persistDraft, 
    flattenAnswers: () => flattenAnswersToPayload(answers), 
    sessionId
  };
}
