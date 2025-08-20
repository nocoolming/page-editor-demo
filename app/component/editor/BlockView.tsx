import type { BlockSchema } from './types';
import { DroppableArea } from './DroppableArea';

// Block 渲染（所见即所得）
export function BlockView({
  block,
  selectedId,
  onSelect,
}: {
  block: BlockSchema;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const selected = selectedId === block.id;
  const baseCls =
    "relative rounded p-2 transition ring-offset-2 " +
    (selected ? " ring-2 ring-blue-500" : "");

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onSelect(block.id);
  };

  if (block.type === "Text") {
    return (
      <div className={baseCls + " bg-white"} onClick={handleClick}>
        <p className="whitespace-pre-wrap">
          {block.props.content || "双击右侧编辑内容"}
        </p>
      </div>
    );
  }
  if (block.type === "Image") {
    return (
      <div className={baseCls + " bg-white"} onClick={handleClick}>
        <img
          className="inline-block max-w-full"
          src={block.props.src || "https://via.placeholder.com/600x200"}
          alt={block.props.alt || ""}
        />
      </div>
    );
  }
  if (block.type === "Container") {
    const dir = block.props.direction === "row" ? "flex-row" : "flex-col";
    const gap = Number(block.props.gap ?? 8);
    return (
      <div className={baseCls + " bg-white/60"} onClick={handleClick}>
        <DroppableArea id={`container:${block.id}`} className={`flex ${dir}`}>
          <div className="flex w-full" style={{ gap }}>
            {(block.children || []).map((child) => (
              <BlockView
                key={child.id}
                block={child}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </DroppableArea>
      </div>
    );
  }
  return null;
}