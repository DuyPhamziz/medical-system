import { renderHook, act } from "@testing-library/react";
import { useFormLogic } from "../hooks/useFormLogic";
import { FormDefinition } from "@/types/form";

// Mock notification store
jest.mock("@/store/notification.store", () => ({
  useNotificationStore: () => ({
    show: jest.fn()
  })
}));

const mockForm: FormDefinition = {
  formId: "form-1",
  title: "Test Form",
  sections: [
    {
      sectionId: "section-1",
      title: "Section 1",
      questions: [
        {
          questionId: "q-1",
          content: "Question 1",
          questionType: "text",
          required: true,
          orderIndex: 0,
          options: []
        }
      ]
    }
  ]
} as any;

describe("useFormLogic hook", () => {
  test("should initialize with default state", () => {
    const { result } = renderHook(() => useFormLogic({ form: mockForm }));

    expect(result.current.activeSectionIndex).toBe(0);
    expect(result.current.answers).toEqual({});
    expect(result.current.progress).toBe(100);
  });

  test("should update answer value", () => {
    const { result } = renderHook(() => useFormLogic({ form: mockForm }));

    act(() => {
      result.current.updateValue("q-1", 0, "valueText", "Hello World");
    });

    expect(result.current.answers["q-1"][0].valueText).toBe("Hello World");
  });

  test("should handle section navigation", () => {
    const multiSectionForm = {
      ...mockForm,
      sections: [
        ...mockForm.sections,
        { sectionId: "section-2", title: "Section 2", questions: [{ questionId: "q-2" }] }
      ]
    } as any;

    const { result } = renderHook(() => useFormLogic({ form: multiSectionForm }));

    act(() => {
      result.current.setActiveSectionIndex(1);
    });

    expect(result.current.activeSectionIndex).toBe(1);
  });
});
