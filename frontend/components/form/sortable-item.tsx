"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
  className?: string;
};

export function SortableItem({ id, children, className }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label="Kéo để sắp xếp lại. Bạn cũng có thể dùng nút lên/xuống ở từng mục."
          title="Kéo để sắp xếp lại"
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true">↕</span>
          <span>Kéo</span>
        </button>
      </div>
      {children}
    </div>
  );
}
