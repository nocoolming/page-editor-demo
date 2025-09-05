import React, { useMemo } from "react";
import type { Block } from './types';
import { config } from './types';
import { getById, clone } from './utils';

export function Inspector({
  data,
  setData,
  selectedId,
}: {
  data: Block[];
  setData: React.Dispatch<React.SetStateAction<Block[]>>;
  selectedId: string | null;
}) {
  const node = useMemo(() => getById(data, selectedId), [data, selectedId]);
  if (!node) {
    return (
      <div style={{ width: 260, borderLeft: "1px solid #ddd", padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Inspector</div>
        <div style={{ color: "#64748b" }}>未选择节点</div>
      </div>
    );
  }
  const fields = config.blocks[node.type].fields;

  const update = (patch: Record<string, any>) => {
    setData((prev) => {
      const draft = clone(prev);
      const target = getById(draft, selectedId);
      if (target) {
        target.props = { ...target.props, ...patch };
      }
      return draft;
    });
  };

  return (
    <div style={{ width: 260, borderLeft: "1px solid #ddd", padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        Inspector — {node.type}
      </div>
      {Object.entries(fields).map(([k, f]: any) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "#475569" }}>{f.label}</label>
          <input
            type={f.type}
            value={node.props[k] ?? ""}
            onChange={(e) => update({ [k]: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              marginTop: 4,
            }}
          />
        </div>
      ))}
      {node.type === "image" && (
        <div style={{ fontSize: 12, color: "#64748b" }}>
          提示：image 默认不可接子节点（如需允许，把 config.blocks.image.acceptsChildren = true）
        </div>
      )}
    </div>
  );
}