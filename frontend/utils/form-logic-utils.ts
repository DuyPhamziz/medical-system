import { AnswersState } from "@/types/form";

/** So sánh nông 2 AnswersState — chỉ quan tâm các key có value khác nhau */
export function answersEqual(a: AnswersState, b: AnswersState): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const qId of aKeys) {
    const aRep = a[qId];
    const bRep = b[qId];
    if (!bRep) return false;
    const aRKeys = Object.keys(aRep);
    const bRKeys = Object.keys(bRep);
    if (aRKeys.length !== bRKeys.length) return false;
    for (const rIdx of aRKeys) {
      const aVals = aRep[Number(rIdx)];
      const bVals = bRep[Number(rIdx)];
      if (!bVals) return false;
      const aVKeys = Object.keys(aVals);
      const bVKeys = Object.keys(bVals);
      if (aVKeys.length !== bVKeys.length) return false;
      for (const key of aVKeys) {
        if (aVals[key] !== bVals[key as keyof typeof aVals]) return false;
      }
    }
  }
  return true;
}

/** So sánh 2 mảng sections (chỉ check questionId tồn tại, không check deep content) */
export function deepEqualSections(
  a: { sectionId?: string; questions: { questionId?: string }[] }[],
  b: { sectionId?: string; questions: { questionId?: string }[] }[],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].sectionId !== b[i].sectionId) return false;
    // Check visibility-based question membership (questionId presence = visible)
    const aQIds = a[i].questions.map((q) => q.questionId).sort();
    const bQIds = b[i].questions.map((q) => q.questionId).sort();
    if (aQIds.length !== bQIds.length) return false;
    for (let j = 0; j < aQIds.length; j++) {
      if (aQIds[j] !== bQIds[j]) return false;
    }
  }
  return true;
}

export function flattenAnswersToPayload(answers: AnswersState): any[] {
  const payload: any[] = [];
  Object.entries(answers).forEach(([qId, repeats]) => {
    Object.entries(repeats).forEach(([idx, values]) => {
      payload.push({ questionId: qId, repeatIndex: Number(idx), ...values });
    });
  });
  return payload;
}

export function getFlatAnswers(answers: AnswersState): Record<string, any> {
  const simpleAnswers: Record<string, any> = {};
  Object.entries(answers).forEach(([qId, repeats]) => {
    const ans = repeats[0] || {};
    let val: any = ans.optionId || ans.valueNumber || ans.valueDate || ans.valueText || null;
    
    if (ans.optionId === "other") val = ans.valueText || "other";
    
    if (!val && ans.valueJson) {
      try { val = JSON.parse(ans.valueJson as string); } catch { val = ans.valueJson; }
    }
    
    simpleAnswers[qId] = val;
  });
  return simpleAnswers;
}
