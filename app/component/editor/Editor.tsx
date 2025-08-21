// Editor.tsx
import React, { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { nanoid } from "nanoid";

// 导入拆分出来的组件和类型
import type { Block } from './types/types';
import { updateBlock } from './utils';
import { DraggableItem } from './dnd/DraggableItem';
import { DroppableContainer } from './dnd/DroppableContainer';
import { BlockRenderer } from './BlockRenderer';

export default function Editor() {
    const [blocks, setBlocks] = useState<Block[]>([]);

    const handleDrop = (overId: string, activeId: string) => {
        const newBlock: Block = {
            id: nanoid(),
            type: activeId,
            props: {},
            isContainer: activeId === "Container",
            children: [],
        };

        if (overId === "root") {
            setBlocks([...blocks, newBlock]);
        } else {
            setBlocks(
                updateBlock(blocks, overId, (b) => ({
                    ...b,
                    children: [...(b.children ?? []), newBlock],
                }))
            );
        }
    };

    return (
        <DndContext
            onDragEnd={({ over, active }) => {
                if (over) {
                    handleDrop(over.id as string, active.id as string);
                }
            }}
        >
            <div className="flex">
                {/* 左边工具栏 */}
                <div className="w-64 p-2">
                    <DraggableItem id="Text" label="Text Block" />
                    <DraggableItem id="Image" label="Image Block" />
                    <DraggableItem id="Container" label="Container Block" />
                </div>

                {/* 右边编辑区 */}
                <div className="grow p-2">
                    <DroppableContainer id="root">
                        {blocks.map((block) => (
                            <BlockRenderer key={block.id} block={block} />
                        ))}
                    </DroppableContainer>
                </div>
            </div>
        </DndContext>
    );
}


