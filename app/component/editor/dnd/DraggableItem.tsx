import { useDraggable } from "@dnd-kit/core";

export function DraggableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform} = useDraggable({ id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 border m-1 bg-gray-200 cursor-grab"
      style={style}
    >
      {label}
    </div>
  );
}