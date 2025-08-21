// 统一导出所有组件
export { default as Editor } from './Editor';
export { DraggableItem } from './dnd/DraggableItem';
export { DroppableContainer } from './dnd/DroppableContainer';
export { BlockRenderer } from './BlockRenderer';

// 导出类型和工具函数
export type { Block } from './types/types';
export { updateBlock } from './utils';

export * from './Editor';