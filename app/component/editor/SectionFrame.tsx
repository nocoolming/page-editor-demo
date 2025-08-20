import { useDroppable } from '@dnd-kit/core';

// 区段框架（仅 hover 显示名称+工具条）
export function SectionFrame({
  name,
  droppableId,
  children,
  onAdd,
  onEdit,
  onDelete,
  isGlobal,
}: {
  name: string;
  droppableId: string;
  children?: React.ReactNode;
  onAdd: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  isGlobal?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  return (
    <div
      ref={setNodeRef}
      className={
        "relative group rounded p-2 min-h-[56px] " + (isOver ? "bg-gray-50" : "")
      }
    >
      {/* 名称条（仅 hover 显示） */}
      <div className="pointer-events-none absolute -top-3 left-2 opacity-0 group-hover:opacity-100 text-[11px] px-1 bg-gray-800 text-white rounded">
        {name}
      </div>
      {/* 工具条（仅 hover 显示） */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
        {isGlobal && (
          <span className="text-[10px] text-blue-500 px-1 py-[1px] border border-blue-200 rounded">
            🔗 全站共享
          </span>
        )}
        <button
          className="text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          ➕
        </button>
        <button
          className="text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          ✏️
        </button>
        {onDelete && (
          <button
            className="text-[10px] px-1 py-[1px] border rounded bg-white hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            🗑
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}