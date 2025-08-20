import type { BlockSchema } from './types';

// 工具函数
export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function findBlockById(
  list: BlockSchema[],
  id: string
): { parent?: BlockSchema; index: number; block?: BlockSchema } {
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (b.id === id) return { index: i, block: b };
    if (b.children?.length) {
      const r = findBlockById(b.children, id);
      if (r.block) return { parent: b, index: r.index, block: r.block };
    }
  }
  return { index: -1 };
}

export function pushIntoContainer(target: BlockSchema, child: BlockSchema) {
  if (!target.children) target.children = [];
  target.children.push(child);
}