// App.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";

/* ===========================
   Config（定义 block 类型与 fields）
   =========================== */
type BlockType = "text" | "image" | "container";

interface FieldConfig {
  key: string;
  label: string;
  type: "string";
}

interface BlockConfig {
  fields: FieldConfig[];
  render: (props: Record<string, any>, children?: React.ReactNode) => React.ReactNode;
  acceptsChildren?: boolean; // 是否可以接收子元素（container:true）
}

const blockConfigs: Record<BlockType, BlockConfig> = {
  text: {
    fields: [{ key: "text", label: "文本", type: "string" }],
    render: (props) => <div className="text-sm">{props.text}</div>,
    acceptsChildren: false,
  },
  image: {
    fields: [{ key: "src", label: "图片URL", type: "string" }],
    render: (props) => <img src={props.src} alt="" className="max-w-xs block" />,
    acceptsChildren: false,
  },
  container: {
    fields: [],
    render: (_, children) => (
      <div className="p-2 border-dashed border-2 border-gray-300 min-h-[36px]">{children}</div>
    ),
    acceptsChildren: true,
  },
};

/* ===========================
   MobX Store（数据树、选中项）
   =========================== */
type Block = {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children: Block[];
};

class EditorStore {
  blocks: Block[] = [];
  selectedId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  addBlock(block: Block, parentId: string | null = null) {
    if (!parentId) {
      this.blocks.push(block);
      return;
    }
    this.blocks = insertAt(this.blocks, parentId, -1, block);
  }

  moveBlock(blockId: string, parentId: string | null, index = -1) {
    // remove then insert
    const { tree: removedTree, removed } = removeById(this.blocks, blockId);
    if (!removed) return;
    this.blocks = insertAt(removedTree, parentId, index, removed);
  }

  removeBlock(blockId: string) {
    const { tree } = removeById(this.blocks, blockId);
    this.blocks = tree;
    if (this.selectedId === blockId) this.selectedId = null;
  }

  select(id: string | null) {
    this.selectedId = id;
  }

  get selectedBlock(): Block | null {
    return getById(this.blocks, this.selectedId);
  }
}

const store = new EditorStore();

/* ===========================
   工具函数：树操作（不可变/返回新树）
   =========================== */

function uid(prefix = "b") {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
}

// 深拷贝简单实现（演示用）
function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// 在 parentId 的 children 的 index 位置插入节点
// parentId === null 表示插入到根
// index < 0 表示追加到末尾
function insertAt(list: Block[], parentId: string | null, index: number, node: Block): Block[] {
  if (parentId === null) {
    const arr = clone(list);
    const i = index < 0 ? arr.length : Math.max(0, Math.min(index, arr.length));
    arr.splice(i, 0, node);
    return arr;
  }
  return list.map((b) => {
    if (b.id === parentId) {
      const arr = clone(b.children || []);
      const i = index < 0 ? arr.length : Math.max(0, Math.min(index, arr.length));
      arr.splice(i, 0, node);
      return { ...b, children: arr };
    }
    return { ...b, children: insertAt(b.children || [], parentId, index, node) };
  });
}

// 从树中删除某 id，返回新的树和被删除的节点
function removeById(list: Block[], id: string): { tree: Block[]; removed: Block | null } {
  const idx = list.findIndex((b) => b.id === id);
  if (idx !== -1) {
    const arr = clone(list);
    const [removed] = arr.splice(idx, 1);
    return { tree: arr, removed };
  }
  for (let i = 0; i < list.length; i++) {
    const { tree: newChildren, removed } = removeById(list[i].children || [], id);
    if (removed) {
      const arr = clone(list);
      arr[i] = { ...arr[i], children: newChildren };
      return { tree: arr, removed };
    }
  }
  return { tree: list, removed: null };
}

// 查找节点（返回引用）
function getById(list: Block[], id: string | null | undefined): Block | null {
  if (!id) return null;
  const stack = [...list];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.id === id) return n;
    if (n.children) stack.unshift(...n.children);
  }
  return null;
}

/* ===========================
   DnD 小组件：Draggable / DropArea
   - palette 拖出的 id 用 palette:TYPE
   - 已存在的 block 用它的 id 作为 active.id
   =========================== */

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
      className={`border p-2 mb-2 bg-white cursor-grab ${isDragging ? "opacity-60" : ""}`}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
    >
      {blockConfigs[type].fields.length ? type : type}
    </div>
  );
}

function DropAreaRoot({ children }: { children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "root" });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-3 border-2 ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}
    >
      {children}
    </div>
  );
}

/* ===========================
   Block 在编辑区的渲染：既能被拖也能被当作 drop target（仅 container 可 drop children）
   选中：使用 onPointerDown 立即 select，阻止冒泡，保证 Inspector 显示
   =========================== */

const EditorBlock = observer(function EditorBlock({ block }: { block: Block }) {
  // draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { id: block.id, type: block.type },
  });

  // container 的 drop 区（如果 acceptsChildren）
  const containerDropId = `container:${block.id}`;
  const accepts = blockConfigs[block.type].acceptsChildren ?? false;
  const { setNodeRef: setContainerDropRef, isOver: isOverContainer } = useDroppable({
    id: containerDropId,
    disabled: !accepts,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
      onPointerDown={(e) => {
        // 立即选中，阻止事件冒泡到 root 清空
        e.stopPropagation();
        store.select(block.id);
      }}
      className={`m-2 p-2 rounded ${store.selectedId === block.id ? "ring-2 ring-blue-400" : "border border-gray-200"} ${isDragging ? "opacity-60" : "bg-white"}`}
    >
      <div>
        {/* 渲染主体 */}
        {blockConfigs[block.type].render(
          block.props,
          block.children.map((c) => <EditorBlock key={c.id} block={c} />)
        )}
      </div>

      {/* 容器内部的显式 droppable 区域（只对 container 类型启用） */}
      {accepts && (
        <div
          ref={setContainerDropRef}
          className={`mt-2 p-2 rounded border-2 ${isOverContainer ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-300 bg-white"}`}
        >
          {/* children are rendered above */}
        </div>
      )}
    </div>
  );
});

/* ===========================
   Inspector（右侧属性面板） — 完全由 MobX 驱动（store.selectedBlock）
   =========================== */

const Inspector = observer(function Inspector() {
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

/* ===========================
   顶层 App（布局使用 Tailwind）
   =========================== */

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
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex flex-row gap-3 p-3 min-h-screen bg-gray-50">
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

/* ===========================
   额外树帮助函数（查找父与索引 / 判断 descendant）
   =========================== */

// 找到父 id 与 索引（parentId null 表示根）
function findParentAndIndex(list: Block[], childId: string, parentId: string | null = null): { parentId: string | null; index: number } | null {
  const idx = list.findIndex(b => b.id === childId);
  if (idx !== -1) return { parentId, index: idx };
  for (const b of list) {
    const res = findParentAndIndex(b.children, childId, b.id);
    if (res) return res;
  }
  return null;
}

// 判断 targetId 是否在 ancestorId 的子树里
function isDescendant(list: Block[], ancestorId: string, targetId: string): boolean {
  const ancestor = getById(list, ancestorId);
  if (!ancestor) return false;
  const stack = [...ancestor.children];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.id === targetId) return true;
    stack.push(...n.children);
  }
  return false;
}

/* ===========================
   渲染到页面
   =========================== */
export default App