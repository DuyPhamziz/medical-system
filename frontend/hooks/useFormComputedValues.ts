import { useMemo, useEffect, useState } from "react";
import { FormDefinition, AnswersState } from "@/types/form";
import { evaluateFormula } from "@/lib/logic-evaluator";
import { getFlatAnswers } from "@/utils/form-logic-utils";

export function useFormComputedValues(form: FormDefinition, answers: AnswersState) {
  const [computedValues, setComputedValues] = useState<Record<string, number | null>>({});
  const flatAnswers = useMemo(() => getFlatAnswers(answers), [answers]);

  useEffect(() => {
    const newComputed: Record<string, number | null> = {};
    form.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.questionType === 'calculated') {
          let formula = "";
          try {
            const config = question.configJson ? JSON.parse(question.configJson) : {};
            formula = config.formula || "";
          } catch (e) {}

          if (formula) {
            newComputed[question.questionId!] = evaluateFormula(formula, flatAnswers);
          }
        }
      });
    });
    setComputedValues(newComputed);
  }, [form.sections, flatAnswers]);

  return computedValues;
}
