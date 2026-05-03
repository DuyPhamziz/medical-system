import { create } from "zustand";
import { createBlankForm, FormDefinition, FormQuestion, FormSection } from "@/types/form";

type FormBuilderState = {
	form: FormDefinition;
	setForm: (form: FormDefinition) => void;
	addSection: () => void;
	addQuestion: (sectionId: string) => void;
	updateQuestion: (sectionId: string, questionId: string, nextQuestion: FormQuestion) => void;
	reorderQuestions: (sectionId: string, nextQuestions: FormQuestion[]) => void;
};

function createQuestion(orderIndex: number): FormQuestion {
	return {
		questionId: crypto.randomUUID(),
		content: "Untitled question",
		questionType: "text",
		required: false,
		allowRepeat: false,
		orderIndex,
		options: [],
	};
}

function createSection(orderIndex: number): FormSection {
	return {
		sectionId: crypto.randomUUID(),
		title: "Untitled section",
		description: "",
		orderIndex,
		allowRepeat: false,
		repeatLabel: "",
		questions: [],
	};
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
	form: createBlankForm(),
	setForm: (form) => set({ form }),
	addSection: () =>
		set((state) => ({
			form: {
				...state.form,
				sections: [...state.form.sections, createSection(state.form.sections.length)],
			},
		})),
	addQuestion: (sectionId) =>
		set((state) => ({
			form: {
				...state.form,
				sections: state.form.sections.map((section) => {
					if (section.sectionId !== sectionId) {
						return section;
					}

					return {
						...section,
						questions: [...section.questions, createQuestion(section.questions.length)],
					};
				}),
			},
		})),
	updateQuestion: (sectionId, questionId, nextQuestion) =>
		set((state) => ({
			form: {
				...state.form,
				sections: state.form.sections.map((section) => {
					if (section.sectionId !== sectionId) {
						return section;
					}

					return {
						...section,
						questions: section.questions.map((question) =>
							question.questionId === questionId ? nextQuestion : question,
						),
					};
				}),
			},
		})),
	reorderQuestions: (sectionId, nextQuestions) =>
		set((state) => ({
			form: {
				...state.form,
				sections: state.form.sections.map((section) =>
					section.sectionId === sectionId
						? { ...section, questions: nextQuestions }
						: section,
				),
			},
		})),
}));
