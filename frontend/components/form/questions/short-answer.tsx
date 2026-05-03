"use client";

import { Input } from "@/components/ui/input";
import { FormQuestion } from "@/types/form";

type Props = {
	question: FormQuestion;
	repeatIndex: number;
	value: string;
	onChange: (repeatIndex: number, value: string) => void;
};

export function ShortAnswerQuestion({ question, repeatIndex, value, onChange }: Props) {
	return (
		<Input
			label={repeatIndex > 0 ? `Lặp #${repeatIndex + 1}` : "Trả lời"}
			value={value}
			onChange={(event) => onChange(repeatIndex, event.target.value)}
			placeholder={question.placeholder ?? undefined}
		/>
	);
}
