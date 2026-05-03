import { FormQuestion } from "@/types/form";

type Props = {
  question: FormQuestion;
  onChange: (question: FormQuestion) => void;
};

export function QuestionCard({ question, onChange }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">

      {/* HEADER */}
      <div className="flex justify-between">
        <input
          className="text-lg font-medium w-full outline-none"
          value={question.content}
          onChange={(e) =>
            onChange({ ...question, content: e.target.value })
          }
          placeholder="Câu hỏi không có tiêu đề"
        />

        <select
          value={question.questionType}
          onChange={(e) =>
            onChange({ ...question, questionType: e.target.value as FormQuestion["questionType"] })
          }
        >
          <option value="text">Đoạn ngắn</option>
          <option value="number">Số</option>
          <option value="date">Ngày</option>
          <option value="single_choice">Trắc nghiệm</option>
          <option value="multiple_choice">Checkbox</option>
          <option value="scale">Thang điểm</option>
        </select>
      </div>

      {/* OPTIONS */}
      {question.questionType === "single_choice" && (
        <div className="mt-4 space-y-2">
          {question.options.map((opt) => (
            <div key={opt.optionId} className="flex items-center gap-2">
              <input type="radio" disabled />
              <input
                className="outline-none"
                value={opt.content}
                onChange={(e) =>
                  onChange({
                    ...question,
                    options: question.options.map(o =>
                      o.optionId === opt.optionId
                        ? { ...o, content: e.target.value }
                        : o
                    )
                  })
                }
              />
            </div>
          ))}

          <button
            className="text-blue-500"
            onClick={() =>
              onChange({
                ...question,
                options: [
                  ...question.options,
                  {
                    optionId: crypto.randomUUID(),
                    content: "",
                    score: 0,
                    orderIndex: question.options.length
                  }
                ]
              })
            }
          >
            + Thêm tùy chọn
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end mt-4 items-center gap-4">
        <span>Bắt buộc</span>
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) =>
            onChange({ ...question, required: e.target.checked })
          }
        />
      </div>
    </div>
  );
}
