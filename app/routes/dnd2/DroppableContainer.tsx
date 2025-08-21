import { useDroppable } from "@dnd-kit/core";

export function DroppableContainer({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`p-2 border-2 min-h-[50px] ${
        isOver ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <div>{children}</div>
    </div>
  );
}