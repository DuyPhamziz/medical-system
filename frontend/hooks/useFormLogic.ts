import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FormAnswerValue, FormDefinition, FormSession } from "@/types/form";
import { useNotificationStore } from "@/store/notification.store";
import { evaluateLogic } from "@/services/form.api";
import { evaluateCondition } from "@/lib/logic-evaluator";

type UseFormLogicProps = {
  form: FormDefinition;
  initialSessionId?: string;
  onSaveDraft?: (payload: { sessionId?: string; answers: FormAnswerValue[] }) => Promise<FormSession | void> | void;
  onSubmit?: (payload: { sessionId?: string; answers: FormAnswerValue[] }) => Promise<FormSession | void> | void;
  useServerLogic?: boolean; // default true
};

type AnswersState = Record<string, Record<number, Record<string, string | number | boolean | null>>>;

export function useFormLogic({ form, initialSessionId, onSaveDraft, useServerLogic = true }: UseFormLogicProps) {
  const { show } = useNotificationStore();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [serverVisibility, setServerVisibility] = useState<Record<string, boolean> | null>(null);
  const [logicError, setLogicError] = useState<string | null>(null);

  const sections = useMemo(() => form.sections ?? [], [form.sections]);

  // Debounced server-side logic evaluation
  useEffect(() => {
    const formId = form.formId;
    if (!useServerLogic || !formId) return;

    const timeoutId = setTimeout(() => {
      // Convert answers to simple format expected by backend: { qId: value }
      const simpleAnswers: Record<string, unknown> = {};
      Object.entries(answers).forEach(([qId, repeats]) => {
        if (repeats[0]) {
          // Prefer optionId for choice questions, otherwise any value
          simpleAnswers[qId] = repeats[0].optionId || repeats[0].valueText || repeats[0].valueNumber || repeats[0].valueDate || null;
        }
      });

      // Only call if we have some answers
      if (Object.keys(simpleAnswers).length === 0) {
        setServerVisibility(null);
        return;
      }

      evaluateLogic(formId, simpleAnswers)
        .then(result => {
          setServerVisibility(result);
          setLogicError(null);
        })
        .catch(err => {
          console.warn("Failed to evaluate logic on server:", err);
          setLogicError(err.message || "Failed to evaluate logic");
          setServerVisibility(null); // fallback to local
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [answers, form.formId, useServerLogic]);

  // Check visibility combining server (authoritative) and local (fallback)
  const checkVisibility = useCallback((item: any, currentAnswers: AnswersState) => {
    // item can be a question or a section
    const id = item.questionId || item.sectionId;

    // If server evaluation is available, use it (authoritative)
    if (useServerLogic && serverVisibility && id) {
      if (serverVisibility.hasOwnProperty(id)) {
        return serverVisibility[id];
      }
    }

    // Fallback to local evaluation
    let triggerLogic = item.triggerLogic;
    let logicRules = [];

    // Check configJson for logicRules if triggerLogic is not directly set
    if (!triggerLogic && item.configJson) {
      try {
        const config = JSON.parse(item.configJson);
        if (config.logicRules) {
          logicRules = config.logicRules;
        }
      } catch (e) {}
    }

    if (!triggerLogic && logicRules.length === 0) {
      // Compatibility with old format where triggerLogic was on options
      if (item.options?.[0]?.triggerLogic) {
        triggerLogic = item.options[0].triggerLogic;
      }
    }

    if (!triggerLogic && logicRules.length === 0) return true;

    try {
      // If we have logicRules, we use the first one for visibility
      if (logicRules.length > 0) {
        const rule = logicRules.find((r: any) => r.action === "SHOW" || r.action === "HIDE");
        if (rule) {
          const condition = rule.condition;
          const isShow = rule.action === "SHOW";
          
          // Prepare answers for evaluateCondition
          const simpleAnswers: Record<string, any> = {};
          Object.entries(currentAnswers).forEach(([qId, repeats]) => {
            const ans = repeats[0] || {};
            let val: any = ans.optionId || ans.valueText || ans.valueNumber || ans.valueDate || null;
            
            // Handle 'other' option specifically
            if (ans.optionId === "other") {
              val = ans.valueText || "other";
            }
            
            // Handle multiple choice (valueJson)
            if (!val && ans.valueJson) {
              try {
                val = JSON.parse(ans.valueJson as string);
              } catch (e) {
                val = ans.valueJson;
              }
            }
            
            simpleAnswers[qId] = val;
          });

          const result = evaluateCondition(condition, simpleAnswers);
          return isShow ? result : !result;
        }
      }

      // Old/Direct triggerLogic handling
      if (triggerLogic) {
        // If it's the old JSON format, we try to handle it for backward compatibility
        if (triggerLogic.startsWith('{') && triggerLogic.endsWith('}')) {
          const rule = JSON.parse(triggerLogic);
          const { sourceQuestionId, operator, value: expectedValue, action } = rule;
          if (!sourceQuestionId) return true;

          const sourceAnswerObj = currentAnswers[sourceQuestionId]?.[0] || {};
          let actualValue: any = sourceAnswerObj.optionId || sourceAnswerObj.valueText || sourceAnswerObj.valueNumber || sourceAnswerObj.valueDate || "";

          let conditionMet = false;
          switch (operator) {
            case "equals": conditionMet = String(actualValue) === String(expectedValue); break;
            case "not_equals": conditionMet = String(actualValue) !== String(expectedValue); break;
            case "greater_than": conditionMet = Number(actualValue) > Number(expectedValue); break;
            case "less_than": conditionMet = Number(actualValue) < Number(expectedValue); break;
            default: conditionMet = true;
          }
          return action === "show" ? conditionMet : !conditionMet;
        }

        // New Expression Format: "show: {{q1}} != {{q2}}"
        let expression = triggerLogic;
        let action = "show";
        if (expression.startsWith("show:")) {
          action = "show";
          expression = expression.substring(5).trim();
        } else if (expression.startsWith("hide:")) {
          action = "hide";
          expression = expression.substring(5).trim();
        }

        const simpleAnswers: Record<string, any> = {};
        Object.entries(currentAnswers).forEach(([qId, repeats]) => {
          const ans = repeats[0] || {};
          simpleAnswers[qId] = ans.optionId || ans.valueText || ans.valueNumber || ans.valueDate || null;
        });

        const result = evaluateCondition(expression, simpleAnswers);
        return action === "show" ? result : !result;
      }

      return true;
    } catch (e) {
      console.error("Logic evaluation error:", e);
      return true;
    }
  }, [useServerLogic, serverVisibility]);

  const visibleSections = useMemo(() => {
    return sections
      .filter(section => checkVisibility(section, answers))
      .map(section => ({
        ...section,
        questions: section.questions.filter(q => checkVisibility(q, answers))
      }))
      .filter(section => section.questions.length > 0);
  }, [sections, answers, checkVisibility]);

  const progress = useMemo(() => (visibleSections.length === 0 ? 0 : Math.round(((activeSectionIndex + 1) / visibleSections.length) * 100)), [activeSectionIndex, visibleSections.length]);

  const flattenAnswers = useCallback((): FormAnswerValue[] => {
    const payload: FormAnswerValue[] = [];
    Object.entries(answers).forEach(([qId, repeats]) => {
      Object.entries(repeats).forEach(([idx, values]) => {
        const item: Record<string, unknown> = { questionId: qId, repeatIndex: Number(idx), ...values };
        payload.push(item as unknown as FormAnswerValue);
      });
    });
    return payload;
  }, [answers]);

  const persistDraft = useCallback(async (isAuto = false) => {
    if (!onSaveDraft || saving) return;
    setSaving(true);
    try {
      const saved = await onSaveDraft({ sessionId, answers: flattenAnswers() });
      if (saved && typeof saved === "object" && "sessionId" in saved) setSessionId(saved.sessionId);
      setLastSaved(new Date());
      if (!isAuto) {
        show({
          type: 'success',
          title: 'Đã lưu bản nháp',
          message: 'Tiến trình của bạn đã được lưu lại thành công.',
        });
      }
    } catch {
      if (!isAuto) {
        show({
          type: 'error',
          title: 'Lỗi lưu bản nháp',
          message: 'Không thể lưu bản nháp lúc này. Vui lòng kiểm tra kết nối.',
        });
      }
    } finally { setSaving(false); }
  }, [onSaveDraft, saving, sessionId, flattenAnswers, show]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); void persistDraft(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [persistDraft]);

  const updateValue = (qId: string, rIdx: number, key: string, val: unknown) => {
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], [rIdx]: { ...prev[qId]?.[rIdx], [key]: val as string | number | boolean | null } } }));
    if (errors[qId]) setErrors(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  return {
    activeSectionIndex, setActiveSectionIndex, sections: visibleSections, progress,
    answers, setAnswers, saving, errors, setErrors, lastSaved,
    updateValue, persistDraft, flattenAnswers, sessionId
  };
}
