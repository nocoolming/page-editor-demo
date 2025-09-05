import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { config } from "./types";

export function DraggableDef({ type }: { type: keyof typeof config }) {
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