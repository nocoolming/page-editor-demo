// dnd-tree-demo.tsx
// 单文件可运行 Demo（React + @dnd-kit/core）
// 数据结构：
// - tree：嵌套的 TreeNode（children 为对象数组）
// - blocks：所有内容数据集中存放（避免循环引用）
// id 全部为数字字符串（"1","2"...）

import React from "react";
import { createRoot } from "react-dom/client";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

// -------- Types --------
type Block = {
  id: string;
  type: "container" | "text" | "image";
  text?: string;
  className?: string;
  src?: string;
  alt?: string;
};

type TreeNode = {
  id: string;
  parentId: string | null;
  rootId: string; // 指向所属的最顶层 root id
  children: TreeNode[];
};

// -------- 初始数据（示例，id 都是数字字符串） --------
const initialRoots: TreeNode[] = [
  {
    id: "1",
    parentId: null,
    rootId: "1",
    children: [
      { id: "2", parentId: "1", rootId: "1", children: [] },
      {
        id: "3",
        parentId: "1",
        rootId: "1",
        children: [
          {
            id: "4",
            parentId: "3",
            rootId: "1",
            children: [
              { id: "5", parentId: "4", rootId: "1", children: [] },
            ],
          },
        ],
      },
    ],
  },
];

const initialBlocks: Record<string, Block> = {
  "1": { id: "1", type: "container", className: "root-box" },
  "2": { id: "2", type: "text", text: "Block A" },
  "3": { id: "3", type: "container", className: "section-box" },
  "4": { id: "4", type: "container", className: "sub-box" },
  "5": { id: "5", type: "text", text: "Block B" },
};

// -------- Helpers: tree 操作（纯数据操作） --------
// 在 nodes 树数组中查找并移除 id，对应位置 splice
// 返回 { removed, parentId, index } 或 null
function findAndRemove(
  nodes: TreeNode[],
  id: string
): { removed: TreeNode; parentId: string | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === id) {
      const removed = nodes.splice(i, 1)[0];
      return { removed, parentId: null, index: i };
    }
    // 在子节点中查找
    const childRes = findAndRemoveInChildren(n, id);
    if (childRes) return childRes;
  }
  return null;
}

function findAndRemoveInChildren(
  parent: TreeNode,
  id: string
): { removed: TreeNode; parentId: string | null; index: number } | null {
  for (let i = 0; i < parent.children.length; i++) {
    const c = parent.children[i];
    if (c.id === id) {
      const removed = parent.children.splice(i, 1)[0];
      return { removed, parentId: parent.id, index: i };
    }
    const deeper = findAndRemoveInChildren(c, id);
    if (deeper) return deeper;
  }
  return null;
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const res = findNode(n.children, id);
    if (res) return res;
  }
  return null;
}

function isDescendant(node: TreeNode, id: string): boolean {
  for (const c of node.children) {
    if (c.id === id) return true;
    if (isDescendant(c, id)) return true;
  }
  return false;
}

function updateRootIdRecursive(node: TreeNode, rootId: string) {
  node.rootId = rootId;
  for (const c of node.children) updateRootIdRecursive(c, rootId);
}

function reinsertNode(
  nodes: TreeNode[],
  node: TreeNode,
  parentId: string | null,
  index: number
): boolean {
  if (parentId === null) {
    nodes.splice(index, 0, node);
    return true;
  }
  const parent = findNode(nodes, parentId);
  if (!parent) return false;
  parent.children.splice(index, 0, node);
  return true;
}

// -------- UI Components --------
function NodeView({
  node,
  blocks,
}: {
  node: TreeNode;
  blocks: Record<string, Block>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: node.id });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: node.id });

  const styleContainer: React.CSSProperties = {
    border: isOver ? "2px dashed #1976d2" : "1px solid #ddd",
    padding: 8,
    margin: 6,
    borderRadius: 6,
    background: isDragging ? "#fafafa" : "#fff",
  };

  const block = blocks[node.id];

  return (
    <div ref={setDropRef} style={styleContainer} data-nodeid={node.id}>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{ cursor: "grab", fontWeight: 600 }}
      >
        {/* 展示 id 与简短内容，便于调试 */}
        {block?.type === "text" ? `${node.id}: ${block.text}` : `${node.id}: ${block?.type}`}
      </div>

      {/* children */}
      <div style={{ paddingLeft: 18 }}>
        {node.children.map((c) => (
          <NodeView key={c.id} node={c} blocks={blocks} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [roots, setRoots] = React.useState<TreeNode[]>(initialRoots);
  const [blocks] = React.useState<Record<string, Block>>(initialBlocks);

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    if (!event.over) return;
    const overId = String(event.over.id);

    if (activeId === overId) return;

    setRoots((prevRoots) => {
      // 深拷贝（保持纯数据结构）
      const newRoots: TreeNode[] = JSON.parse(JSON.stringify(prevRoots));

      // 1) 从 newRoots 中删除 active 节点（并拿到原位置信息）
      const removedInfo = findAndRemove(newRoots, activeId);
      if (!removedInfo) return prevRoots; // 没找到，保持原状

      const { removed, parentId, index } = removedInfo;

      // 2) 找到 over 节点
      const overNode = findNode(newRoots, overId);
      if (!overNode) {
        // 如果目标不存在（理论上不应该），把节点放回原位
        reinsertNode(newRoots, removed, parentId, index);
        return newRoots;
      }

      // 3) 防止把节点插入到自己的子孙中（会形成循环）
      if (isDescendant(removed, overId) || removed.id === overId) {
        // 恢复原位
        reinsertNode(newRoots, removed, parentId, index);
        return newRoots;
      }

      // 4) 插入到 overNode.children（默认末尾），并更新 parentId/rootId
      removed.parentId = overNode.id;
      removed.rootId = overNode.rootId;
      updateRootIdRecursive(removed, overNode.rootId);
      overNode.children.push(removed);

      // 返回新的树
      console.log("moved", activeId, "->", overId);
      console.log("new roots:", JSON.stringify(newRoots, null, 2));
      return newRoots;
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ padding: 16, fontFamily: "sans-serif" }}>
        <h3>嵌套 Tree + blocks（可拖拽）Demo</h3>
        <p style={{ color: "#555" }}>
          说明：把任意节点拖到目标节点上，节点会移动为目标的子节点。
        </p>

        <div>
          {roots.map((r) => (
            <NodeView key={r.id} node={r} blocks={blocks} />
          ))}
        </div>

        <hr />
        <details>
          <summary>调试：当前树 JSON（点我查看）</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
            {JSON.stringify(roots, null, 2)}
          </pre>
        </details>
      </div>
    </DndContext>
  );
}


