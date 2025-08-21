import type { Block } from './types';

// 工具函数：递归更新 block 树
export function updateBlock(
  blocks: Block[],
  blockId: string,
  updater: (b: Block) => Block
): Block[] {
  return blocks.map((b) => {
    if (b.id === blockId) return updater(b);
    if (b.children) {
      return { ...b, children: updateBlock(b.children, blockId, updater) };
    }
    return b;
  });
}