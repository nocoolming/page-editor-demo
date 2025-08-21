import type { Block } from './types/types';
import { DroppableContainer } from './dnd/DroppableContainer';

export function BlockRenderer({
    block,
    onDrop,
}: {
    block: Block;
    onDrop: (overId: string, activeId: string) => void;
}) {
    const content = (
        <div className="p-2 bg-white border mb-2">
            <div className="font-bold">{block.type}</div>
            {block.children?.map((child) => (
                <BlockRenderer key={child.id} block={child} onDrop={onDrop} />
            ))}
        </div>
    );

    // ✅ 只有 Container 才能成为 Droppable
    if (block.isContainer) {
        return (
            <DroppableContainer id={block.id} onDrop={onDrop}>
                {content}
            </DroppableContainer>
        );
    }

    return content;
}
