// App.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import type { Block } from "./Block";
import { editStore as store } from "./store/store";

/** ============ UI - 可拖拽Block ============ */
const DraggableBlock = observer(({ block }: { block: Block }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: block.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.6 : 1,
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 8,
    padding: 8,
    margin: "6px 0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
        #{block.id} / {block.type}（父: {block.parentId}）
      </div>

      {/* 内容区：可简单编辑文本观察 MobX 响应 */}
      {block.type === "text" && (
        <input
          value={block.text ?? ""}
          onChange={(e) => store.updateText(block.id, e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: "6px 8px",
          }}
        />
      )}
      {block.type === "image" && (
        <div style={{ padding: "6px 8px" }}>🖼 {block.text ?? "图片"}</div>
      )}
      {block.type === "container" && (
        <div style={{ padding: "6px 8px" }}>{block.text ?? "容器"}</div>
      )}

      {/* 如果是容器：内部是一个可放置区，能把其它块拖进来 */}
      {block.type === "container" && (
        <DroppableChildren parentId={block.id} childrenBlocks={block.children} />
      )}
    </div>
  );
});

/** ============ UI - droppable 子区域（容器内部） ============ */
const DroppableChildren = observer(
  ({
    parentId,
    childrenBlocks,
  }: {
    parentId: string;
    childrenBlocks: Block[];
  }) => {
    const { isOver, setNodeRef } = useDroppable({ id: parentId });
    return (
      <div
        ref={setNodeRef}
        style={{
          border: "2px dashed " + (isOver ? "#4096ff" : "#e5e7eb"),
          background: isOver ? "rgba(64,150,255,0.08)" : "#fafafa",
          padding: 8,
          borderRadius: 8,
          minHeight: 40,
        }}
      >
        {childrenBlocks.length === 0 && (
          <div style={{ color: "#9ca3af", fontSize: 12 }}>
            拖动块到这里（容器内）
          </div>
        )}
        {childrenBlocks.map((child) => (
          <DraggableBlock key={child.id} block={child} />
        ))}
      </div>
    );
  }
);

/** ============ UI - 根层可放置区域 ============ */
const RootDroppable = observer(() => {
  // 根区域的 droppable id 固定为 "root"
  const { isOver, setNodeRef } = useDroppable({ id: "root" });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: "2px dashed " + (isOver ? "#22c55e" : "#e5e7eb"),
        background: isOver ? "rgba(34,197,94,0.08)" : "#fff",
        padding: 12,
        borderRadius: 10,
        minHeight: 120,
      }}
    >
      {store.rootBlocks.length === 0 && (
        <div style={{ color: "#9ca3af", fontSize: 12 }}>拖动块到根层</div>
      )}
      {store.rootBlocks.map((b) => (
        <DraggableBlock key={b.id} block={b} />
      ))}
    </div>
  );
});

/** ============ App ============ */
const App = observer(() => {
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active || !over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // 仅允许拖到：容器的 children 区 或 根区域
    // 根区域 id === "root"
    // 容器的 droppable id === 容器 block 的 id
    store.moveNodeToParent(activeId, overId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <div
        style={{
          padding: 16,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h2 style={{ margin: 0 }}>MobX + dnd-kit：拖到容器或根</h2>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          说明：拖动任意块，放入容器（蓝框）或放到根层（绿框）。禁止把父节点拖进自己的子树。
        </div>

        {/* 根层可放置区域（把块放到根） */}
        <RootDroppable />
      </div>
    </DndContext>
  );
});

export default App;