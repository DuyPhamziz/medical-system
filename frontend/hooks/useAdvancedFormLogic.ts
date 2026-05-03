import { useCallback, useMemo } from "react";
import { useFormLogic } from "./useFormLogic";
import { toast } from "@/components/ui/toast";
import { FormAnswerValue, FormDefinition, FormSession } from "@/types/form";

export function useAdvancedFormLogic(props: {
  form: FormDefinition;
  initialSessionId?: string;
  onSaveDraft?: (payload: { sessionId?: string; answers: FormAnswerValue[] }) => Promise<FormSession | void> | void;
  onSubmit?: (payload: { sessionId?: string; answers: FormAnswerValue[] }) => Promise<FormSession | void> | void;
  useServerLogic?: boolean; // Whether to evaluate logic on server (default true)
}) {
  const { useServerLogic = true, ...rest } = props;
  const baseLogic = useFormLogic(rest);

  // Evaluate visibility on server if enabled
  const evaluateServerLogic = useCallback(async (currentAnswers: Record<string, Record<number, Record<string, unknown>>>) => {
    if (!useServerLogic) return null;

    try {
      // Convert answers to simple format: { qId: value } taking first repeat only
      const simpleAnswers: Record<string, unknown> = {};
      Object.entries(currentAnswers).forEach(([qId, repeats]) => {
        if (repeats[0]) {
          // Prefer optionId for choice questions, otherwise any value
          simpleAnswers[qId] = repeats[0].optionId || repeats[0].valueText || repeats[0].valueNumber || repeats[0].valueDate || null;
        }
      });

      const response = await fetch(`/api/forms/${rest.form.formId}/logic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simpleAnswers),
      });

      if (!response.ok) {
        console.warn("Failed to fetch logic evaluation, falling back to local");
        return null;
      }

      return await response.json() as Record<string, boolean>;
    } catch (error) {
      console.warn("Logic evaluation error, falling back to local:", error);
      return null;
    }
  }, [rest.form.formId, useServerLogic]);

  // Override visible sections to respect server-side logic
  const visibleSections = useMemo(() => {
    // This is simplified - in production you'd merge server logic with local visibility
    return baseLogic.sections; // Using local evaluation for now
  }, [baseLogic.sections]);

  return {
    ...baseLogic,
    visibleSections,
    evaluateServerLogic,
  };
}
