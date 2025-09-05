import { config } from "./types";
import { DraggableDef } from "./DraggableDef";

export function BlockList() {
  return (
    <div style={{ width: "150px", borderRight: "1px solid #ccc", padding: "8px" }}>
      <h4>Blocks</h4>
      {Object.keys(config).map((key) => (
        <DraggableDef key={key} type={key as keyof typeof config} />
      ))}
    </div>
  );
}