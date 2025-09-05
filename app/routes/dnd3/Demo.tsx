import React, { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// -------------------- Config（可扩展，和 Puck 思想一致） --------------------
const config = {
  blocks: {
    text: {
      label: "Text",
      acceptsChildren: false,
      defaultProps: { text: "New text" },
      fields: { text: { type: "text", label: "Text" } },
      render: (props: any) => <p style={{ margin: 0 }}>{props.text}</p>,
    },
    image: {
      label: "Image",
      acceptsChildren: false, // 如需让 image 也能接子元素，改成 true
      defaultProps: {
        url: "https://picsum.photos/640/320",
        alt: "image",
      },
      fields: {
        url: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt text" },
      },
      render: (props: any) => (
        <img
          src={props.url}
          alt={props.alt}
          style={{ display: "block", maxWidth: "100%" }}
        />
      ),
    },
    container: {
      label: "Container",
      acceptsChildren: true,
      defaultProps: {},
      fields: {},
      render: (_: any, children: React.ReactNode) => (
        <div style={{ border: "1px dashed #999", padding: 8, minHeight: 40 }}>
          {children}
        </div>
      ),
    },
  },
};
type BlockType = keyof typeof config.blocks;

type Block = {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children: Block[];
};

// -------------------- 工具函数（树操作） --------------------
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// 查找 child 的父亲与索引
function findParentAndIndex(
  list: Block[],
  childId: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  const idx = list.findIndex((b) => b.id === childId);
  if (idx !== -1) return { parentId, index: idx };
  for (const b of list) {
    const sub = findParentAndIndex(b.children, childId, b.id);
    if (sub) return sub;
  }
  return null;
}

// 在 parentId 的 children 指定位置插入（index < 0 表示追加到末尾）
function insertAt(
  list: Block[],
  parentId: string | null,
  index: number,
  node: Block
): Block[] {
  if (parentId === null) {
    const arr = [...list];
    const i = index < 0 ? arr.length : index;
    arr.splice(i, 0, node);
    return arr;
  }
  return list.map((b) => {
    if (b.id === parentId) {
      const arr = [...b.children];
      const i = index < 0 ? arr.length : index;
      arr.splice(i, 0, node);
      return { ...b, children: arr };
    }
    return { ...b, children: insertAt(b.children, parentId, index, node) };
  });
}

// 从树中移除某个节点，返回 { tree, removed }
function removeById(
  list: Block[],
  id: string
): { tree: Block[]; removed: Block | null } {
  const idx = list.findIndex((b) => b.id === id);
  if (idx !== -1) {
    const arr = [...list];
    const [removed] = arr.splice(idx, 1);
    return { tree: arr, removed };
  }
  for (let i = 0; i < list.length; i++) {
    const child = removeById(list[i].children, id);
    if (child.removed) {
      const copy = [...list];
      copy[i] = { ...copy[i], children: child.tree };
      return { tree: copy, removed: child.removed };
    }
  }
  return { tree: list, removed: null };
}

// 判断 targetId 是否在 ancestorId 的子树里（防止把节点拖进自己的后代）
function isDescendant(list: Block[], ancestorId: string, targetId: string): boolean {
  const stack = [...list];
  let foundAncestor: Block | null = null;
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === ancestorId) {
      foundAncestor = n;
      break;
    }
    stack.push(...n.children);
  }
  if (!foundAncestor) return false;
  // DFS
  const st = [...foundAncestor.children];
  while (st.length) {
    const n = st.pop()!;
    if (n.id === targetId) return true;
    st.push(...n.children);
  }
  return false;
}

// 通过 id 拿 block（选中/编辑）
function getById(list: Block[], id: string | null): Block | null {
  if (!id) return null;
  const stack = [...list];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === id) return n;
    stack.push(...n.children);
  }
  return null;
}

// -------------------- 左侧：Block List（palette） --------------------
function PaletteItem({ type }: { type: BlockType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { paletteType: type },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        border: "1px solid #ccc",
        padding: "6px 8px",
        marginBottom: 6,
        background: "#fff",
        cursor: "grab",
        fontSize: 14,
      }}
    >
      {config.blocks[type].label}
    </div>
  );
}

function BlockList() {
  const types = Object.keys(config.blocks) as BlockType[];
  return (
    <div style={{ width: 180, borderRight: "1px solid #ddd", padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Blocks</div>
      {types.map((t) => (
        <PaletteItem key={t} type={t} />
      ))}
    </div>
  );
}

// -------------------- 中间：编辑区 --------------------
function RootDropBar() {
  // 一个显式的“放到根部”的投放条，避免容器占满导致无法落到根
  const { setNodeRef, isOver } = useDroppable({ id: "root" });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: `2px dashed ${isOver ? "#3b82f6" : "#cbd5e1"}`,
        borderRadius: 6,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#475569",
        marginTop: 8,
        marginBottom: 8,
        background: isOver ? "rgba(59,130,246,0.06)" : "transparent",
        fontSize: 13,
      }}
    >
      拖到这里放到根部
    </div>
  );
}

function Editor({
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

        {/* 始终保留一个“放到根”的投放条 */}
        <RootDropBar />
      </div>
    </div>
  );
}

function EditorBlock({
  block,
  selectedId,
  onSelect,
}: {
  block: Block;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  // 这个节点作为“可排序项目”（可拖动 & 可作为排序目标）
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: block.id,
  });

  const isSelected = selectedId === block.id;
  const baseStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    border: isSelected ? "2px solid #3b82f6" : "1px solid #cbd5e1",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    background: "#fff",
  };

  // 如果该类型支持 children，就在“内容区域”加一个专门的 droppable
  const accepts = config.blocks[block.type].acceptsChildren;
  const dropId = `container:${block.id}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropId,
    disabled: !accepts,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      style={baseStyle}
    >
      {/* 渲染主体 */}
      {block.type === "container" ? (
        <div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
            Container
          </div>
          <div
            ref={setDropRef}
            style={{
              border: `2px dashed ${
                isOver ? "#3b82f6" : "rgba(203,213,225,0.8)"
              }`,
              borderRadius: 6,
              padding: 8,
              background: isOver ? "rgba(59,130,246,0.06)" : "transparent",
              minHeight: 40,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 容器的 children 列表也要是一个 SortableContext */}
            <SortableContext items={block.children.map((c) => c.id)}>
              {block.children.map((child) => (
                <EditorBlock
                  key={child.id}
                  block={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      ) : (
        config.blocks[block.type].render(block.props)
      )}
    </div>
  );
}

// -------------------- 右侧：属性面板（简单版） --------------------
function Inspector({
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

// -------------------- 主应用 --------------------
export default function App() {
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
        // 落在某个 item 上：插到它“前面”
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

      // 同级内部拖动：如果从同一父亲移除后，目标 index 需要在“新的数组”里重新计算
      if (targetParent !== null) {
        if (overId && !overId.startsWith("container:") && overId !== "root") {
          // 重新计算“目标 item”在移除后的索引
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
