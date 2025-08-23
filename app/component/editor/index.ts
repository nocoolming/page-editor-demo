// 统一导出所有组件
export { default as Editor } from './core/Editor';
export { DraggableItem } from './dnd/DraggableItem';
export { DroppableContainer } from './dnd/DroppableContainer';
export { BlockRenderer } from './BlockRenderer';

// 导出类型和工具函数
export type { Block } from './types/Block';
export { updateBlock } from './utils';

export * from './core/Editor';