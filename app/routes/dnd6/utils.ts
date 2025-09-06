import type { Block } from "./types";

export function uid(prefix = "b") {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
}

// 深拷贝简单实现（演示用）
export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// 在 parentId 的 children 的 index 位置插入节点
// parentId === null 表示插入到根
// index < 0 表示追加到末尾
export function insertAt(list: Block[], parentId: string | null, index: number, node: Block): Block[] {
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
export function removeById(list: Block[], id: string): { tree: Block[]; removed: Block | null } {
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
export function getById(list: Block[], id: string | null | undefined): Block | null {
  if (!id) return null;
  const stack = [...list];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.id === id) return n;
    if (n.children) stack.unshift(...n.children);
  }
  return null;
}

// 找到父 id 与 索引（parentId null 表示根）
export function findParentAndIndex(list: Block[], childId: string, parentId: string | null = null): { parentId: string | null; index: number } | null {
  const idx = list.findIndex(b => b.id === childId);
  if (idx !== -1) return { parentId, index: idx };
  for (const b of list) {
    const res = findParentAndIndex(b.children, childId, b.id);
    if (res) return res;
  }
  return null;
}

// 判断 targetId 是否在 ancestorId 的子树里
export function isDescendant(list: Block[], ancestorId: string, targetId: string): boolean {
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