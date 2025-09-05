import { useDroppable } from "@dnd-kit/core";

export function RootDropBar() {
  // 一个显式的"放到根部"的投放条，避免容器占满导致无法落到根
  const { setNodeRef, isOver } = useDroppable({ id: "root" });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: `2px dashed ${isOver ? "#3b82f6" : "#cbd5e1"}`,
        borderRadius: 6,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#475569",
        marginTop: 8,
        marginBottom: 8,
        background: isOver ? "rgba(59,130,246,0.06)" : "transparent",
        fontSize: 13,
      }}
    >
      拖到这里放到根部
    </div>
  );
}