import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { BlockType } from './types';
import { config } from './types';

export function PaletteItem({ type }: { type: BlockType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { paletteType: type },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        border: "1px solid #ccc",
        padding: "6px 8px",
        marginBottom: 6,
        background: "#fff",
        cursor: "grab",
        fontSize: 14,
      }}
    >
      {config.blocks[type].label}
    </div>
  );
}