import React from "react";

type Block = {
  id: string;
  type: string;
  props: Record<string, any>;
};

interface BlockRendererProps {
  block: Block;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case "TextBlock":
      return (
        <div className="p-2 border rounded bg-white">
          <h3 className="font-bold">{block.props.title || "未命名文本块"}</h3>
          <p>{block.props.content || "请输入内容..."}</p>
        </div>
      );

    case "ImageBlock":
      return (
        <div className="p-2 border rounded bg-white">
          {block.props.url ? (
            <img
              src={block.props.url}
              alt={block.props.alt || "图片"}
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="text-gray-400">未设置图片</div>
          )}
        </div>
      );

    case "ButtonBlock":
      return (
        <div className="p-2 border rounded bg-white">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {block.props.label || "按钮"}
          </button>
        </div>
      );

    default:
      return <div className="text-gray-500">未知区块类型: {block.type}</div>;
  }
};

export default BlockRenderer;
