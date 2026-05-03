"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormOption } from "@/types/form";

type Props = {
    option: FormOption;
    onChange: (option: FormOption) => void;
    onDelete: () => void;
};

export function OptionItem({ option, onChange, onDelete }: Props) {
    return (
        <div className="grid gap-3 md:grid-cols-[1fr_120px_1fr] items-end">
            <Input
                label="Content"
                value={option.content}
                onChange={(e) => onChange({ ...option, content: e.target.value })}
            />
            <Input
                type="number"
                label="Score"
                value={option.score}
                onChange={(e) => onChange({ ...option, score: Number(e.target.value) })}
            />
            <Button variant="secondary" onClick={onDelete}>
                Delete
            </Button>
        </div>
    );
}