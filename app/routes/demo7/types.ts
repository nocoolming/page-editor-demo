

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
  type: string;
  props: Record<string, any>;
  defaultProps: Record<string, any>;
  parentId: string;
  children: Block[];
};

export type Config = {
  components: Block;

}
