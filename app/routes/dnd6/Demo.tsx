import { useState } from "react";
import { DndContext } from "@dnd-kit/core";

// 导入拆分出来的组件和类型
import type { Block } from "./types";
import { config } from "./types";
import { BlockList } from "./BlockList";
import { DroppableEditor } from "./DroppableEditor";
import { Inspector } from "./Inspector";

// Main App
export default function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  function handleDragEnd(event: any) {
    const { over, active } = event;
    if (!over) return;

    if (over.id === "editor" && active.data.current?.defType) {
      const type = active.data.current.defType as keyof typeof config;
      const newBlock: Block = {
        id: Date.now().toString(),
        type,
        props: Object.fromEntries(config[type].fields.map((f) => [f.name, f.default])),
        children: [],
      };
      setBlocks((prev) => [...prev, newBlock]);
    }
  }

  function updateBlock(id: string, newProps: Record<string, any>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...newProps } } : b))
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100vh" }}>
        <BlockList />
        <DroppableEditor blocks={blocks} setSelected={setSelectedId} />
        <Inspector block={selectedBlock} update={updateBlock} />
      </div>
    </DndContext>
  );
}