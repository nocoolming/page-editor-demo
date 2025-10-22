import type { DefaultComponentProps } from "./Props";

export type BaseData<
  Props extends { [key: string]: any } = { [key: string]: any }
> = {
  readOnly?: Partial<Record<keyof Props, boolean>>;
};


export type ComponentData = {
  id: string,
  type: string,
  props: { [key: string]: any },
}

export type Data = {
  header: [],
  body: [],
  footer: [],
}
