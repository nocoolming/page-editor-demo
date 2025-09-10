import React from "react";
import { observer } from "mobx-react-lite";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Block } from "./types";
import { blockConfigs } from "./config";
import { store } from "./store";

export const EditorBlock = observer(function EditorBlock({ block }: { block: Block }) {
  // draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: block.id,
    data: {
      id: block.id,
      type: block.type
    },
  });

  // container 的 drop 区（如果 acceptsChildren）
  const containerDropId = `container:${block.id}`;
  const accepts = blockConfigs[block.type].acceptsChildren ?? false;
  const {
    setNodeRef: setContainerDropRef,
    isOver: isOverContainer } = useDroppable({
      id: containerDropId,
      disabled: !accepts,
    });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: transform ?
          `translate(${transform.x}px, ${transform.y}px)`
          : undefined
      }}
      onPointerDown={(e) => {
        // 立即选中，阻止事件冒泡到 root 清空
        e.stopPropagation();
        store.select(block.id);
      }}
      className={` rounded ${store.selectedId === block.id ? "ring-2 ring-blue-400" : "border border-gray-200"} ${isDragging ? "opacity-60" : "bg-white"}`}
    >
      <div>
        {/* 渲染主体 */}
        {blockConfigs[block.type].render(
          block.props,
          block.children.map((c) => <EditorBlock key={c.id} block={c} />)
        )}
      </div>

      {/* 容器内部的显式 droppable 区域（只对 container 类型启用） */}
      {accepts && (
        <div
          ref={setContainerDropRef}
          className={`mt-2 rounded border-2 ${isOverContainer ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-300 bg-white"}`}
        >
          {/* children are rendered above */}
        </div>
      )}
    </div>
  );
});