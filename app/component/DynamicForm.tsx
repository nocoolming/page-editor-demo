import React from "react";

type Block = {
  id: string;
  type: string;
  props: Record<string, any>;
};

interface DynamicFormProps {
  block: Block;
  onChange: (props: Record<string, any>) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ block, onChange }) => {
  const handleChange = (key: string, value: string) => {
    onChange({ ...block.props, [key]: value });
  };

  switch (block.type) {
    case "TextBlock":
      return (
        <div className="space-y-2">
          <label className="block">
            标题:
            <input
              type="text"
              value={block.props.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-1 border rounded"
            />
          </label>
          <label className="block">
            内容:
            <textarea
              value={block.props.content || ""}
              onChange={(e) => handleChange("content", e.target.value)}
              className="w-full p-1 border rounded"
            />
          </label>
        </div>
      );

    case "ImageBlock":
      return (
        <div className="space-y-2">
          <label className="block">
            图片地址:
            <input
              type="text"
              value={block.props.url || ""}
              onChange={(e) => handleChange("url", e.target.value)}
              className="w-full p-1 border rounded"
            />
          </label>
          <label className="block">
            替代文字:
            <input
              type="text"
              value={block.props.alt || ""}
              onChange={(e) => handleChange("alt", e.target.value)}
              className="w-full p-1 border rounded"
            />
          </label>
        </div>
      );

    case "ButtonBlock":
      return (
        <div className="space-y-2">
          <label className="block">
            按钮文字:
            <input
              type="text"
              value={block.props.label || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              className="w-full p-1 border rounded"
            />
          </label>
        </div>
      );

    default:
      return <div className="text-gray-500">没有可编辑的属性</div>;
  }
};

export default DynamicForm;
