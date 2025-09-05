import type { Block } from "./types";
import { config } from "./types";

export function Inspector({
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