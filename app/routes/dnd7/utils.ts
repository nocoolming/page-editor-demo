import type { Block } from './types';

// 工具函数（树操作）
export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// 查找 child 的父亲与索引
export function findParentAndIndex(
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
export function insertAt(
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
export function removeById(
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
export function isDescendant(list: Block[], ancestorId: string, targetId: string): boolean {
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
export function getById(list: Block[], id: string | null): Block | null {
  if (!id) return null;
  const stack = [...list];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === id) return n;
    stack.push(...n.children);
  }
  return null;
}