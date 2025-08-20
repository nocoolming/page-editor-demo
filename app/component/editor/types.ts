// 数据结构定义
export type BlockSchema = {
  id: string;
  type: "Header" | "Footer" | "Text" | "Image" | "Container";
  props: Record<string, any>;
  children?: BlockSchema[];
};

export type PageSchema = {
  header: BlockSchema;
  template: BlockSchema[];
  footer: BlockSchema;
};