import { useDraggable } from '@dnd-kit/core';

export function PaletteItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="px-2 py-1 border rounded mb-1 cursor-grab select-none"
    >
      {label}
    </div>
  );
}