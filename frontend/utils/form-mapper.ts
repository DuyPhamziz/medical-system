import { FormDefinition, FormQuestion, FormSection, FormOption, FormQuestionType } from "@/types/form";

type FormOptionResponse = {
  optionId?: string;
  content?: string;
  score?: number;
  orderIndex?: number;
  triggerLogic?: string | null;
};

type FormQuestionResponse = {
  questionId?: string;
  content?: string;
  questionType?: string;
  required?: boolean;
  allowRepeat?: boolean;
  orderIndex?: number;
  minValue?: number | null;
  maxValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  validationPattern?: string | null;
  validationMessage?: string | null;
  placeholder?: string | null;
  helperText?: string | null;
  scaleMin?: number | null;
  scaleMax?: number | null;
  triggerLogic?: string | null;
  configJson?: string | null;
  parentQuestionId?: string | null;
  parentOptionId?: string | null;
  subQuestions?: FormQuestionResponse[];
  options?: FormOptionResponse[];
};

type FormSectionResponse = {
  sectionId?: string;
  title?: string;
  description?: string | null;
  orderIndex?: number;
  allowRepeat?: boolean;
  repeatLabel?: string | null;
  questions?: FormQuestionResponse[];
};

type FormResponsePayload = {
  formId?: string;
  title?: string;
  description?: string | null;
  template?: boolean;
  publicForm?: boolean;
  visibility?: "PUBLIC" | "DOCTOR_ONLY" | "PRIVATE";
  paid?: boolean;
  price?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  createdByName?: string;
  sections?: FormSectionResponse[];
};

export const mapQuestionTypeToBE = (type: string): string => {
  if (!type) return "TEXT";
  return type.toUpperCase();
};

export const mapQuestionTypeFE = (type: string): FormQuestionType => {
  if (!type) return "text";
  return type.toLowerCase() as FormQuestionType;
};

export const mapOptionToRequest = (option: FormOption) => ({
  optionId: option.optionId,
  content: option.content,
  score: option.score ?? 0,
  orderIndex: option.orderIndex,
  triggerLogic: option.triggerLogic || null,
});

export const mapQuestionToRequest = (question: FormQuestion): any => {
  // Extract custom config from specific types if not already in configJson
  let configJson = (question as any).configJson;
  
  // If it's a matrix or pedigree, we might need to stringify some extra config
  if (!configJson && (question.questionType === 'matrix' || question.questionType === 'pedigree')) {
    // This is a safety fallback
    configJson = JSON.stringify({});
  }

  return {
    questionId: question.questionId,
    content: question.content,
    questionType: mapQuestionTypeToBE(question.questionType),
    required: question.required,
    allowRepeat: question.allowRepeat,
    orderIndex: question.orderIndex,
    minValue: question.minValue || null,
    maxValue: question.maxValue || null,
    minLength: question.minLength || null,
    maxLength: question.maxLength || null,
    validationPattern: question.validationPattern || null,
    validationMessage: question.validationMessage || null,
    placeholder: question.placeholder || null,
    helperText: question.helperText || null,
    scaleMin: question.scaleMin || null,
    scaleMax: question.scaleMax || null,
    triggerLogic: question.triggerLogic || null,
    configJson: configJson || null,
    options: (question.options || []).map(mapOptionToRequest),
    subQuestions: (question.subQuestions || []).map(mapQuestionToRequest),
  };
};

export const mapQuestionFromResponse = (question: FormQuestionResponse): FormQuestion => ({
  questionId: question.questionId ?? crypto.randomUUID(),
  content: question.content ?? "",
  questionType: mapQuestionTypeFE(question.questionType ?? "TEXT"),
  required: question.required ?? false,
  allowRepeat: question.allowRepeat ?? false,
  orderIndex: question.orderIndex ?? 0,
  minValue: question.minValue ?? undefined,
  maxValue: question.maxValue ?? undefined,
  minLength: question.minLength ?? undefined,
  maxLength: question.maxLength ?? undefined,
  validationPattern: question.validationPattern ?? undefined,
  validationMessage: question.validationMessage ?? undefined,
  placeholder: question.placeholder ?? undefined,
  helperText: question.helperText ?? undefined,
  scaleMin: question.scaleMin ?? undefined,
  scaleMax: question.scaleMax ?? undefined,
  triggerLogic: question.triggerLogic ?? undefined,
  configJson: question.configJson ?? undefined,
  options: (question.options ?? []).map((option: FormOptionResponse) => ({
    optionId: option.optionId ?? crypto.randomUUID(),
    content: option.content ?? "",
    score: option.score ?? 0,
    orderIndex: option.orderIndex ?? 0,
    triggerLogic: option.triggerLogic ?? undefined,
  })),
  subQuestions: (question.subQuestions ?? []).map(mapQuestionFromResponse),
});

export const mapSectionToRequest = (section: FormSection) => ({
  sectionId: section.sectionId,
  title: section.title,
  description: section.description || "",
  orderIndex: section.orderIndex,
  allowRepeat: section.allowRepeat,
  repeatLabel: section.repeatLabel || null,
  questions: (section.questions || []).map(mapQuestionToRequest),
});

export const mapFormToRequest = (form: FormDefinition) => ({
  title: form.title,
  description: form.description || "",
  template: form.template ?? false,
  publicForm: form.publicForm ?? false,
  visibility: form.visibility ?? "DOCTOR_ONLY",
  paid: form.paid ?? false,
  price: form.price ?? 0,
  sections: (form.sections || []).map(mapSectionToRequest),
});

export const mapFormFromResponse = (response: FormResponsePayload): FormDefinition => ({
  formId: response.formId,
  title: response.title ?? "",
  description: response.description,
  template: response.template ?? false,
  publicForm: response.publicForm ?? false,
  visibility: response.visibility ?? "DOCTOR_ONLY",
  paid: response.paid ?? false,
  price: response.price ?? 0,
  status: response.status ?? "DRAFT",
  version: response.version ?? 1,
  publishedAt: response.publishedAt,
  createdAt: response.createdAt,
  updatedAt: response.updatedAt,
  createdById: response.createdById,
  createdByName: response.createdByName,
  sections: (response.sections ?? []).map((section: FormSectionResponse) => ({
    sectionId: section.sectionId,
    title: section.title ?? "",
    description: section.description,
    orderIndex: section.orderIndex ?? 0,
    allowRepeat: section.allowRepeat ?? false,
    repeatLabel: section.repeatLabel,
    questions: (section.questions ?? []).map(mapQuestionFromResponse),
  })),
});
