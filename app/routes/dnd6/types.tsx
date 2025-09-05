// 类型定义
export type Block = {
  id: string;
  type: keyof typeof config;
  props: Record<string, any>;
  children: Block[];
};

// Block 配置
export const config = {
  text: {
    label: "文本",
    render: (props: any) => <div>{props.text}</div>,
    fields: [{
      name: "text",
      label: "文本内容",
      type: "string",
      default: "新建文本"
    }],
  },
  image: {
    label: "图片",
    render: (props: any) => <img src={props.src} alt={props.alt} style={{ maxWidth: 150 }} />,
    fields: [
      {
        name: "src",
        label: "图片地址",
        type: "string",
        default: ""
      },
      {
        name: "alt",
        label: "替代文字",
        type: "string",
        default: "图片"
      },
    ],
  },
};