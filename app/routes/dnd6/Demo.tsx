import React from "react";
import { 
  DndContext,
   closestCenter, 
   type DragEndEvent } from "@dnd-kit/core";
import { observer } from "mobx-react-lite";
import type { Block, BlockType } from "./types";
import { PaletteItem } from "./PaletteItem";
import { DropAreaRoot } from "./DropAreaRoot";
import { EditorBlock } from "./EditorBlock";
import { Inspector } from "./Inspector";
import { store } from "./store";
import { uid, removeById, insertAt, findParentAndIndex, isDescendant } from "./utils";

const App = observer(function App() {
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active) return;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;

    // palette -> new block
    if (activeId.startsWith("palette:") && overId) {
      const type = activeId.split(":")[1] as BlockType;
      const newBlock: Block = {
        id: uid(),
        type,
        props: type === "text" ? { text: "默认文本" } : type === "image" ? { src: "https://picsum.photos/300/180" } : {},
        children: [],
      };

      // drop 到 root
      if (overId === "root") {
        store.addBlock(newBlock, null);
        return;
      }

      // drop 到 container area
      if (overId.startsWith("container:")) {
        const pid = overId.split(":")[1];
        store.addBlock(newBlock, pid);
        return;
      }

      // drop 在某 item 上 -> 插入到该 item 前面（同级）
      // 找到这个 item 的 parent
      const parentInfo = findParentAndIndex(store.blocks, overId);
      const parentId = parentInfo ? parentInfo.parentId : null;
      const index = parentInfo ? parentInfo.index : -1;
      store.addBlock(newBlock, parentId);
      // then move to position if index >=0 (we just appended; adjust)
      if (index >= 0) {
        // remove appended and insert at position:
        const { tree: removedTree, removed } = removeById(store.blocks, newBlock.id);
        if (removed) {
          store.blocks = insertAt(removedTree, parentId, index, removed);
        }
      }
      return;
    }

    // existing block move (drag activeId is block.id)
    if (!activeId.startsWith("palette:") && overId) {
      const movingId = activeId;

      // prevent drop onto itself
      if (movingId === overId) return;

      // drop to root
      if (overId === "root") {
        store.moveBlock(movingId, null);
        return;
      }

      // drop to container area
      if (overId.startsWith("container:")) {
        const pid = overId.split(":")[1];
        // prevent dropping into its own descendant
        if (isDescendant(store.blocks, movingId, pid)) return;
        store.moveBlock(movingId, pid);
        return;
      }

      // drop on an item -> insert before it on same parent
      const where = findParentAndIndex(store.blocks, overId);
      if (!where) return;
      // prevent invalid (dropping parent into child)
      if (isDescendant(store.blocks, movingId, where.parentId ?? "")) return;

      // move and place before index
      store.moveBlock(movingId, where.parentId);
      // Now adjust order: remove then insert at index
      const { tree: removedTree, removed } = removeById(store.blocks, movingId);
      if (removed) {
        store.blocks = insertAt(removedTree, where.parentId, where.index, removed);
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} 
    collisionDetection={closestCenter}>
      <div className="flex flex-row gap-3  min-h-screen bg-gray-50">
        {/* 左侧：固定宽度 */}
        <div className="w-48 border bg-white p-3">
          <div className="font-semibold mb-3">Blocks</div>
          <div className="space-y-2">
            <PaletteItem type="text" />
            <PaletteItem type="image" />
            <PaletteItem type="container" />
          </div>
        </div>

        {/* 中间：grow / 填充 */}
        <div className="flex-1">
          <DropAreaRoot>
            {/* 渲染树 */}
            <div>
              {store.blocks.map((b) => (
                <EditorBlock key={b.id} block={b} />
              ))}
            </div>
          </DropAreaRoot>
        </div>

        {/* 右侧：固定宽度 */}
        <Inspector />
      </div>
    </DndContext>
  );
});

export default App;