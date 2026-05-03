import { useState, useCallback } from "react";
import { FormDefinition, FormSection, FormQuestionType, FormQuestion } from "@/types/form";
import { reorder } from "@/utils/reorder";

export function useFormBuilder(initialData?: Partial<FormDefinition>) {
  const [form, setForm] = useState<FormDefinition>(() => ({
    title: initialData?.title || "Biểu mẫu mới",
    description: initialData?.description || "",
    template: initialData?.template ?? false,
    publicForm: initialData?.publicForm ?? false,
    paid: initialData?.paid ?? false,
    price: initialData?.price ?? 0,
    status: initialData?.status || "DRAFT",
    version: initialData?.version || 1,
    sections: initialData?.sections || [],
    ...initialData
  } as FormDefinition));

  const addSection = useCallback(() => {
    const newSection: FormSection = {
      sectionId: crypto.randomUUID(),
      title: "Phần mới",
      orderIndex: form.sections.length,
      allowRepeat: false,
      questions: []
    };
    setForm(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  }, [form.sections.length]);

  const addQuestion = useCallback((sectionId: string, type: FormQuestionType = "text") => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.sectionId === sectionId ? {
        ...s,
        questions: [...s.questions, {
          questionId: crypto.randomUUID(),
          content: "Câu hỏi mới",
          questionType: type,
          required: false,
          allowRepeat: false,
          orderIndex: s.questions.length,
          options: []
        }]
      } : s)
    }));
  }, []);

  const updateSection = useCallback((sectionId: string, updates: Partial<FormSection>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.sectionId === sectionId ? { ...s, ...updates } : s)
    }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.sectionId !== sectionId)
    }));
  }, []);

  const updateQuestion = useCallback((sectionId: string, questionId: string, updates: Partial<FormQuestion>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.sectionId === sectionId ? {
        ...s,
        questions: s.questions.map(q => q.questionId === questionId ? { ...q, ...updates } : q)
      } : s)
    }));
  }, []);

  const removeQuestion = useCallback((sectionId: string, questionId: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.sectionId === sectionId ? {
        ...s,
        questions: s.questions.filter(q => q.questionId !== questionId)
      } : s)
    }));
  }, []);

  const onReorderSections = useCallback((activeId: string, overId: string) => {
    setForm(prev => {
      const oldIdx = prev.sections.findIndex(s => s.sectionId === activeId);
      const newIdx = prev.sections.findIndex(s => s.sectionId === overId);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return { ...prev, sections: reorder(prev.sections, oldIdx, newIdx) };
    });
  }, []);

  return { 
    form, 
    setForm, 
    addSection, 
    updateSection,
    removeSection,
    addQuestion, 
    updateQuestion, 
    removeQuestion,
    onReorderSections 
  };
}
