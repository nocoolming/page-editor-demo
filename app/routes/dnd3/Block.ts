/** ============ 数据结构 ============ */
export type Block = {
    id: string; // 用数字字符串，例如 "1","2"...
    text?: string;
    parentId: string; // "root" 表示在根层
    children: Block[];
    type: "container" | "text" | "image";
  };