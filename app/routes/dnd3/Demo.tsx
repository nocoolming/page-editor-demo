import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ---------------- Block Config ----------------
const config = {
  text: {
    label: "文本",
    render: (props: any) => <div>{props.text}</div>,
    fields: [{ name: "text", label: "文本内容", type: "string", default: "新建文本" }],
  },
  image: {
    label: "图片",
    render: (props: any) => <img src={props.src} alt={props.alt} style={{ maxWidth: 150 }} />,
    fields: [
      { name: "src", label: "图片地址", type: "string", default: "" },
      { name: "alt", label: "替代文字", type: "string", default: "图片" },
    ],
  },
};

type Block = {
  id: string;
  type: keyof typeof config;
  props: Record<string, any>;
  children: Block[];
};

// ---------------- Block List (左边) ----------------
function DraggableDef({ type }: { type: keyof typeof config }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "def-" + type,
    data: { defType: type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    border: "1px solid #aaa",
    padding: "4px",
    margin: "4px",
    background: "#eee",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {config[type].label}
    </div>
  );
}

function BlockList() {
  return (
    <div style={{ width: "150px", borderRight: "1px solid #ccc", padding: "8px" }}>
      <h4>Blocks</h4>
      {Object.keys(config).map((key) => (
        <DraggableDef key={key} type={key as keyof typeof config} />
      ))}
    </div>
  );
}

// ---------------- 编辑区 (中间) ----------------
function DroppableEditor({
  blocks,
  setBlocks,
  setSelected,
}: {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setSelected: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "editor" });

  const style = {
    flex: 1,
    padding: "16px",
    minHeight: "400px",
    background: isOver ? "#def" : "#fafafa",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <h4>Editor</h4>
      {blocks.map((b) => (
        <div
          key={b.id}
          style={{ border: "1px dashed #aaa", margin: "4px", padding: "4px" }}
          onClick={() => setSelected(b.id)}
        >
          {config[b.type].render(b.props)}
        </div>
      ))}
    </div>
  );
}

// ---------------- Inspector (右边) ----------------
function Inspector({
  block,
  update,
}: {
  block: Block | null;
  update: (id: string, props: Record<string, any>) => void;
}) {
  if (!block) return <div style={{ padding: "8px" }}>未选中</div>;

  return (
    <div style={{ width: "200px", borderLeft: "1px solid #ccc", padding: "8px" }}>
      <h4>属性</h4>
      {config[block.type].fields.map((f) => (
        <div key={f.name} style={{ marginBottom: "8px" }}>
          <label>{f.label}:</label>
          <input
            type="text"
            value={block.props[f.name]}
            onChange={(e) => update(block.id, { [f.name]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------- Main App ----------------
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
        <DroppableEditor blocks={blocks} setBlocks={setBlocks} setSelected={setSelectedId} />
        <Inspector block={selectedBlock} update={updateBlock} />
      </div>
    </DndContext>
  );
}
