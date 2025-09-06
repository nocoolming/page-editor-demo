import React from "react";
import { observer } from "mobx-react-lite";
import { blockConfigs } from "./config";
import { store } from "./store";

export const Inspector = observer(function Inspector() {
  const node = store.selectedBlock;
  return (
    <div className="w-64 border p-3 bg-white">
      <div className="font-semibold mb-3">Inspector</div>
      {!node && <div className="text-gray-500">未选择 Block</div>}
      {node && (
        <div>
          <div className="text-sm text-gray-700 mb-2">Type: {node.type}</div>
          {blockConfigs[node.type].fields.map((f) => (
            <div className="mb-3" key={f.key}>
              <label className="block text-xs text-gray-600 mb-1">{f.label}</label>
              <input
                className="w-full border p-1"
                value={node.props[f.key] ?? ""}
                onChange={(e) => {
                  node.props[f.key] = e.target.value;
                }}
              />
            </div>
          ))}

          <div className="mt-4">
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={() => {
                if (confirm("删除当前节点？")) {
                  store.removeBlock(node.id);
                }
              }}
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
});