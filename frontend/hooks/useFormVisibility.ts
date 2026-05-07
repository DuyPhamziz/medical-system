import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { FormDefinition, AnswersState } from "@/types/form";
import { evaluateLogic } from "@/services/form.api";
import { evaluateCondition } from "@/lib/logic-evaluator";
import { deepEqualSections, getFlatAnswers } from "@/utils/form-logic-utils";

export function useFormVisibility(form: FormDefinition, answers: AnswersState, useServerLogic: boolean) {
  const [serverVisibility, setServerVisibility] = useState<Record<string, boolean> | null>(null);
  const [logicError, setLogicError] = useState<string | null>(null);

  const flatAnswers = useMemo(() => getFlatAnswers(answers), [answers]);
  const serverVisibilityRef = useRef(serverVisibility);
  serverVisibilityRef.current = serverVisibility;

  // Determine if we really need server logic for this form
  const needsServerLogic = useMemo(() => {
    if (!useServerLogic) return false;
    // Check if any rule looks "complex" (e.g., uses keywords the client doesn't support yet, or is marked for server)
    // For now, we'll assume standard rules are client-compatible
    return false; // Toggle this to true if you want to force server evaluation
  }, [useServerLogic]);

  useEffect(() => {
    const formId = form.formId;
    if (!needsServerLogic || !formId) return;

    const timeoutId = setTimeout(() => {
      if (Object.keys(flatAnswers).length === 0) {
        setServerVisibility(null);
        return;
      }

      evaluateLogic(formId, flatAnswers)
        .then(result => {
          setServerVisibility(result);
          setLogicError(null);
        })
        .catch(err => {
          console.warn("Failed to evaluate logic on server:", err);
          setLogicError(err.message || "Failed to evaluate logic");
          setServerVisibility(null);
        });
    }, 800); // Increased debounce for server calls

    return () => clearTimeout(timeoutId);
  }, [form.formId, needsServerLogic, flatAnswers]);

  const checkVisibility = useCallback((item: any, currentAnswers: AnswersState) => {
    const id = item.questionId || item.sectionId;
    const sv = serverVisibilityRef.current;
    
    // Always try client-side first for immediate response
    let clientResult = true;
    let hasClientLogic = false;

    let triggerLogic = item.triggerLogic;
    let logicRules: any[] = [];

    if (!triggerLogic && item.configJson) {
      try {
        const config = JSON.parse(item.configJson);
        if (config.logicRules) logicRules = config.logicRules;
      } catch (e) {}
    }

    if (!triggerLogic && logicRules.length === 0 && item.options?.[0]?.triggerLogic) {
      triggerLogic = item.options[0].triggerLogic;
    }

    if (triggerLogic || logicRules.length > 0) {
      hasClientLogic = true;
      try {
        if (logicRules.length > 0) {
          const rule = logicRules.find((r: any) => r.action === "SHOW" || r.action === "HIDE");
          if (rule) {
            const result = evaluateCondition(rule.condition, getFlatAnswers(currentAnswers));
            clientResult = rule.action === "SHOW" ? result : !result;
          }
        } else if (triggerLogic) {
          let expression = triggerLogic;
          let action = "show";
          if (expression.startsWith("show:")) {
            action = "show";
            expression = expression.substring(5).trim();
          } else if (expression.startsWith("hide:")) {
            action = "hide";
            expression = expression.substring(5).trim();
          }
          const result = evaluateCondition(expression, getFlatAnswers(currentAnswers));
          clientResult = action === "show" ? result : !result;
        }
      } catch (e) {
        clientResult = true; // Fallback to visible
      }
    }

    // If we have a server result and it's complex, it might override client result
    if (needsServerLogic && sv && id && sv.hasOwnProperty(id)) {
      return sv[id];
    }

    return clientResult;
  }, [needsServerLogic]);

  const prevVisibleRef = useRef<any[] | null>(null);
  const visibleSections = useMemo(() => {
    const next = (form.sections ?? [])
      .filter(section => checkVisibility(section, answers))
      .map(section => ({
        ...section,
        questions: section.questions.filter(q => checkVisibility(q, answers))
      }))
      .filter(section => section.questions.length > 0);

    const prev = prevVisibleRef.current;
    if (prev && deepEqualSections(prev, next)) return prev;
    prevVisibleRef.current = next;
    return next;
  }, [form.sections, answers, checkVisibility]);

  return { visibleSections, logicError };
}
