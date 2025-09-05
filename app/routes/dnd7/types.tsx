import type { p } from "node_modules/react-router/dist/development/context-DohQKLID.mjs";
import React from "react";

// 类型定义和配置
export const config = {
  blocks: {
    text: {
      label: "Text",
      acceptsChildren: false,
      defaultProps: { text: "New text" },
      fields: { text: { type: "text", label: "Text" } },
      render: (props: any) => <p style={{ margin: 0 }}>{props.text}</p>,
    },
    image: {
      label: "Image",
      acceptsChildren: false, // 如需让 image 也能接子元素，改成 true
      defaultProps: {
        url: "https://picsum.photos/640/320",
        alt: "image",
      },
      fields: {
        url: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt text" },
      },
      render: (props: any) => (
        <img
          src={props.url}
          alt={props.alt}
          style={{ display: "block", maxWidth: "100%" }}
        />
      ),
    },
    container: {
      label: "Container",
      acceptsChildren: true,
      defaultProps: {},
      fields: {},
      render: (_: any, children: React.ReactNode) => (
        <div style={{ border: "1px dashed #999", padding: 8, minHeight: 40 }}>
          {children}
        </div>
      ),
    },
  },
};

export type BlockType = keyof typeof config.blocks;

export type Block = {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children: Block[];
};