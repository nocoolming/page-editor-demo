import { useDroppable } from '@dnd-kit/core';

// 通用可投放区域
export function DroppableArea({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={
        "min-h-[40px] rounded " + (isOver ? "bg-gray-50 " : "") + (className || "")
      }
    >
      {children}
    </div>
  );
}