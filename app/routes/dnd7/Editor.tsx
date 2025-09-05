import React, { useMemo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import type { Block } from './types';
import { EditorBlock } from './EditorBlock';
import { RootDropBar } from './RootDropBar';

export function Editor({
  data,
  setData,
  selectedId,
  setSelectedId,
}: {
  data: Block[];
  setData: React.Dispatch<React.SetStateAction<Block[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  // 根级 children 的 SortableContext
  const ids = useMemo(() => data.map((b) => b.id), [data]);

  return (
    <div style={{ flex: 1, padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Editor</div>
      <div style={{ border: "1px dashed #ddd", padding: 12, minHeight: 320 }}>
        <SortableContext items={ids}>
          {data.map((b) => (
            <EditorBlock
              key={b.id}
              block={b}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </SortableContext>

        {/* 始终保留一个"放到根"的投放条 */}
        <RootDropBar />
      </div>
    </div>
  );
}