// 统一导出所有组件
export { default as Editor } from './Editor';
export { DraggableItem } from './DraggableItem';
export { DroppableContainer } from './DroppableContainer';
export { BlockRenderer } from './BlockRenderer';

// 导出类型和工具函数
export type { Block } from './types';
export { updateBlock } from './utils';