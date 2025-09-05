import { useDroppable } from "@dnd-kit/core";
import type { Block } from "./types";
import { config } from "./types";

export function DroppableEditor({
  blocks,
  setSelected,
}: {
  blocks: Block[];
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