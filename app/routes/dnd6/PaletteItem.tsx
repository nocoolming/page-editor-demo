import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { BlockType } from "./types";
import { blockConfigs } from "./config";

export function PaletteItem({ type }: { type: BlockType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `palette:${type}`,
    data: { paletteType: type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`border  mb-2 bg-white cursor-grab ${isDragging ? "opacity-60" : ""}`}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
    >
      {blockConfigs[type].fields.length ? type : type}
    </div>
  );
}