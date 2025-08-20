// 统一导出所有编辑器组件
export { default as MvpPageEditor } from './MvpPageEditor';
export { ComponentLibrary } from './ComponentLibrary';
export { PaletteItem } from './PaletteItem';
export { DroppableArea } from './DroppableArea';
export { BlockView } from './BlockView';
export { TreeItem } from './TreeItem';
export { BlocksPanel } from './BlocksPanel';
export { PropsPanel } from './PropsPanel';
export { SectionFrame } from './SectionFrame';

// 导出类型和工具函数
export type { BlockSchema, PageSchema } from './types';
export { clone, findBlockById, pushIntoContainer } from './utils';