// 类型定义
export type Block = {
  id: string;
  type: string;
  props?: Record<string, any>;
  isContainer: boolean;
  children?: Block[];
};