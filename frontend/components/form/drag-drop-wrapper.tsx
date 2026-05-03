"use client";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

type ItemWithId = { id: string };

type Props<T extends ItemWithId> = {
  items: T[];
  onReorder: (nextItems: T[]) => void;
  children: (items: T[]) => React.ReactNode;
};

/**
 * Generic drag-drop wrapper for sections/questions/options
 * Uses @dnd-kit for stable and accessible drag sorting
 */
export function DragDropWrapper<T extends ItemWithId>({ items, onReorder, children }: Props<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {children(items)}
      </SortableContext>
    </DndContext>
  );
}
