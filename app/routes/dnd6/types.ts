export type BlockType = "text" | "image" | "container";

export interface FieldConfig {
  key: string;
  label: string;
  type: "string";
}

export interface BlockConfig {
  fields: FieldConfig[];
  render: (props: Record<string, any>, children?: React.ReactNode) => React.ReactNode;
  acceptsChildren?: boolean;
}

export type Block = {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children: Block[];
};