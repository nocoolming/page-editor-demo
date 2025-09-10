import React from "react";
import type { BlockType, BlockConfig } from "./types";

export const blockConfigs: Record<BlockType, BlockConfig> = {
  text: {
    fields: [{ key: "text", label: "文本", type: "string" }],
    render: (props) => <div className="text-sm">{props.text}</div>,
    acceptsChildren: false,
  },
  image: {
    fields: [{ key: "src", label: "图片URL", type: "string" }],
    render: (props) => <img src={props.src} alt="" className="max-w-xs block" />,
    acceptsChildren: false,
  },
  container: {
    fields: [],
    render: (_, children) => (
      <div className=" border-dashed border-2 border-gray-300 min-h-[36px]">{children}</div>
    ),
    acceptsChildren: true,
  },
};