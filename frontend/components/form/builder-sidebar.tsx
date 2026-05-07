"use client";

import { useFormBuilderStore } from "@/store/form-builder.store";

export function BuilderSidebar() {
  const addQuestion = useFormBuilderStore(s => s.addQuestion);
  const firstSectionId = useFormBuilderStore(s => s.form.sections[0]?.sectionId);

  return (
    <div className="w-60 border-l p-4">
      <button
        className="w-full mb-2 bg-blue-500 text-white p-2 rounded"
        disabled={!firstSectionId}
        onClick={() => {
          if (firstSectionId) {
            addQuestion(firstSectionId);
          }
        }}
      >
        + Add Question
      </button>
    </div>
  );
}
