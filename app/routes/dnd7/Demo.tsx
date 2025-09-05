import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Block, BlockType } from './types';
import { config } from './types';
import { 
  uid, 
  findParentAndIndex, 
  insertAt, 
  removeById, 
  isDescendant,
  getById 
} from './utils';
import { BlockList } from './BlockList';
import { Editor } from './Editor';
import { Inspector } from './Inspector';

export default function Demo() {
  const [data, setData] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // —— 从 palette 创建新节点：
    if (activeId.startsWith("palette:")) {
      const type = activeId.split(":")[1] as BlockType;
      const newBlock: Block = {
        id: uid(),
        type,
        props: { ...config.blocks[type].defaultProps },
        children: [],
      };

      setData((prev) => {
        // 目标 = 根部
        if (overId === "root") {
          return insertAt(prev, null, -1, newBlock);
        }
        // 目标 = 容器的 children 区域
        if (overId.startsWith("container:")) {
          const parentId = overId.split(":")[1];
          return insertAt(prev, parentId, -1, newBlock);
        }
        // 目标 = 某个具体 item（插在它前面）
        const where = findParentAndIndex(prev, overId);
        if (!where) return prev;
        return insertAt(prev, where.parentId, where.index, newBlock);
      });
      return;
    }

    // —— 编辑区内移动/排序：
    const movingId = activeId; // useSortable 的 id = block.id
    setData((prev) => {
      let tree = prev;
      // 目标 parent / index 计算
      let targetParent: string | null = null;
      let targetIndex = -1;

      if (overId === "root") {
        targetParent = null;
        targetIndex = prev.length; // 追加到根
      } else if (overId.startsWith("container:")) {
        targetParent = overId.split(":")[1];
        // 防止把节点拖进自己的子树
        if (isDescendant(prev, movingId, targetParent)) return prev;
        const parentNode = getById(prev, targetParent);
        targetIndex = parentNode ? parentNode.children.length : -1;
      } else {
        // 落在某个 item 上：插到它"前面"
        const where = findParentAndIndex(prev, overId);
        if (!where) return prev;
        targetParent = where.parentId;
        targetIndex = where.index;
        if (targetParent && isDescendant(prev, movingId, targetParent)) {
          return prev;
        }
      }

      // 先移除 movingId
      const { tree: removedTree, removed } = removeById(tree, movingId);
      if (!removed) return prev;

      // 同级内部拖动：如果从同一父亲移除后，目标 index 需要在"新的数组"里重新计算
      if (targetParent !== null) {
        if (overId && !overId.startsWith("container:") && overId !== "root") {
          // 重新计算"目标 item"在移除后的索引
          const where2 = findParentAndIndex(removedTree, overId);
          if (where2 && where2.parentId === targetParent) {
            targetIndex = where2.index;
          }
        }
      } else {
        // 根级同级排序
        if (overId !== "root" && !overId.startsWith("container:")) {
          const where2 = findParentAndIndex(removedTree, overId);
          if (where2 && where2.parentId === null) {
            targetIndex = where2.index;
          }
        }
      }

      return insertAt(removedTree, targetParent, targetIndex, removed);
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <BlockList />
        <Editor
          data={data}
          setData={setData}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
        <Inspector data={data} setData={setData} selectedId={selectedId} />
      </div>
    </DndContext>
  );
}