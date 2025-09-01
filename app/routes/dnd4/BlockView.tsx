import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Block } from "./Block";

export function BlocksView({
    blocks,
}: {
    blocks: Block[],
}) {
    if (!blocks) {
        return <></>
    }


    // console.log(JSON.stringify(blocks));

    return (
        <>
            {
                blocks.map((b: Block) => (
                    <BlockView
                     key={b.id} 
                     block={b} />
                ))
            }
        </>
    )
}

export function BlockView({
    block,
}: {
    block: Block,
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: block.id });

    const { isOver, setNodeRef: setDropRef } = useDroppable({ id: block.id });

    return (
        <div
            ref={setDropRef}
            data-nodeid={block.id}
            style={{
                border: isOver ? "2px dashed #1976d2" : "1px solid #ddd",
                background: isDragging ? "#fafafa" : "#fff",
            }}
            className="w-full h-32 p-3 m-3 rounded-2xl">
            <div
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                style={{ cursor: 'grab', fontWeight: 600 }}
            >
                {block?.type === 'text' ? `${block.id}: ${block.text}` : `${block.id}: ${block.type}`}
            </div>

            {/* children */}
            <div className="pl-8">
                {  
                    block.children?.map(b => (
                    <BlockView
                        key={b.id}
                        block={b}
                    />
                ))}
            </div>
        </div>
    )
}

