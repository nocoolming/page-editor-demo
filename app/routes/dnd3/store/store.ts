// store.ts
import { makeAutoObservable, observable } from "mobx";
import {type Block} from '../Block';

class EditorStore {
  /** 顶层 blocks（parentId === "root"） */
  rootBlocks: Block[] = observable.array([], { deep: true });

  constructor() {
    makeAutoObservable(this);

    // 初始化：根下两个块，其中一个是容器，另一个是文本
    this.rootBlocks.replace([
      {
        id: "1",
        parentId: "root",
        type: "container",
        text: "容器 1",
        children: [
          {
            id: "2",
            parentId: "1",
            type: "text",
            text: "文本 A（在容器1里）",
            children: [],
          },
          {
            id: "3",
            parentId: "1",
            type: "image",
            text: "图片块",
            children: [],
          },
        ],
      },
      {
        id: "4",
        parentId: "root",
        type: "container",
        text: "容器 2",
        children: [],
      },
      {
        id: "5",
        parentId: "root",
        type: "text",
        text: "根层文本 B",
        children: [],
      },
    ]);
  }

  /** 递归查找：返回 { node, parent }；parent 为 null 表示在根层 */
  findWithParent(
    id: string,
    list: Block[] = this.rootBlocks,
    parent: Block | null = null
  ): { node: Block; parent: Block | null } | null {
    for (const node of list) {
      if (node.id === id) return { node, parent };
      const hit = this.findWithParent(id, node.children, node);
      if (hit) return hit;
    }
    return null;
  }

  /** 判断 targetId 是否在 activeId 的子树中（用于防止把父拖进自己的后代） */
  isDescendant(activeId: string, targetId: string): boolean {
    const found = this.findWithParent(activeId);
    if (!found) return false;
    const dfs = (n: Block): boolean => {
      if (n.id === targetId) return true;
      for (const c of n.children) if (dfs(c)) return true;
      return false;
    };
    return dfs(found.node);
  }

  /** 从原位置移除节点（返回该节点实例） */
  removeNode(id: string): Block | null {
    const hit = this.findWithParent(id);
    if (!hit) return null;

    const { node, parent } = hit;
    if (parent) {
      const idx = parent.children.findIndex((x) => x.id === id);
      if (idx >= 0) parent.children.splice(idx, 1);
    } else {
      const idx = this.rootBlocks.findIndex((x) => x.id === id);
      if (idx >= 0) this.rootBlocks.splice(idx, 1);
    }
    return node;
  }

  /** 插入到某个父节点（末尾）。parentId === "root" 表示插入到根 */
  insertToParent(parentId: string, node: Block) {
    if (parentId === "root") {
      node.parentId = "root";
      this.rootBlocks.push(node);
      return;
    }
    const target = this.findWithParent(parentId);
    if (!target) return;
    target.node.children.push(node);
    node.parentId = parentId;
  }

  /** 移动节点到目标父（末尾） */
  moveNodeToParent(nodeId: string, newParentId: string) {
    // 阻止拖进自己的后代
    if (newParentId !== "root" && this.isDescendant(nodeId, newParentId)) {
      console.warn("不能将父节点拖入其后代中");
      return;
    }
    const node = this.removeNode(nodeId);
    if (!node) return;
    this.insertToParent(newParentId, node);
  }

  /** 简单文本修改，便于观察响应式 */
  updateText(id: string, text: string) {
    const hit = this.findWithParent(id);
    if (hit) hit.node.text = text;
  }
}

export const editStore = new EditorStore();