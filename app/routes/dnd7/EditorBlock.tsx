import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from './types';
import { config } from './types';

export function EditorBlock({
  block,
  selectedId,
  onSelect,
}: {
  block: Block;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  // 这个节点作为"可排序项目"（可拖动 & 可作为排序目标）
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: block.id,
  });

  const isSelected = selectedId === block.id;
  const baseStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    border: isSelected ? "2px solid #3b82f6" : "1px solid #cbd5e1",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    background: "#fff",
  };

  // 如果该类型支持 children，就在"内容区域"加一个专门的 droppable
  const accepts = config.blocks[block.type].acceptsChildren;
  const dropId = `container:${block.id}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropId,
    disabled: !accepts,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      style={baseStyle}
    >
      {/* 渲染主体 */}
      {block.type === "container" ? (
        <div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
            Container
          </div>
          <div
            ref={setDropRef}
            style={{
              border: `2px dashed ${
                isOver ? "#3b82f6" : "rgba(203,213,225,0.8)"
              }`,
              borderRadius: 6,
              padding: 8,
              background: isOver ? "rgba(59,130,246,0.06)" : "transparent",
              minHeight: 40,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 容器的 children 列表也要是一个 SortableContext */}
            <SortableContext items={block.children.map((c) => c.id)}>
              {block.children.map((child) => (
                <EditorBlock
                  key={child.id}
                  block={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      ) : (
        config.blocks[block.type].render(block.props)
      )}
    </div>
  );
}