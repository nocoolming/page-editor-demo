import { useState } from "react"
import { type Block } from "./Block";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { findNode, initCache, insertBlock, isDescendant, removeBlock } from "./utilities";
import { BlocksView, BlockView } from "./BlockView";

const initData: Block[] = [
    {
        id: '1',
        type: 'text',
        text: 'Hello',
        parentId: undefined,
        children: [],
    },
    {
        id: '2',
        type: 'container',
        parentId: undefined,
        children: [
            {
                id: '3',
                type: 'text',
                text: 'This is inner text',
                parentId: undefined,
                children: [],
            },
        ],
    },
];



export default function BlockRoute() {
    const [blocks, setBlocks] = useState<Block[]>(initData);
    const [dataset, setDataSet] = useState({});

    let cache = initCache(blocks, {});
    console.log(JSON.stringify(cache));

    const handlerDragEnd = (e: DragEndEvent) => {
        const activeId = String(e.active.id);

        if (!e.over) {
            return;
        }

        const overId = String(e.over.id);

        if (activeId === overId) {
            return;
        }

        setBlocks(prevBlocks => {
            // 深拷贝 （保持纯数据结构）
            const newBlocks: Block[] = JSON.parse(JSON.stringify(prevBlocks));

            // 找到over节点
            const overBlock = findNode({
                id: overId,
                dataset: cache
            });
            if (!overBlock) {
                return prevBlocks;
            }
            debugger;
            const block: Block = findNode({ id: activeId, dataset: cache });

            // 防止把节点插入到自己的子孙中（防止循环依赖）
            if (isDescendant(block, overId) || block.id === overId) {
                return prevBlocks;
            }

            // 删除原来的位置 
            removeBlock({ id: activeId, dataset: cache });

            // 插入到overNode.children（默认末尾）, 并更新parentId
            insertBlock({
                block: block,
                index: 0,
                parentId: overId,
                dataset: cache,
            })

            return newBlocks;
        })
    }

    return (
        <DndContext onDragEnd={handlerDragEnd}>
            <div className="p-8">
                <h1 className="text-center">
                    嵌套tree + blocks 拖拽 demo
                </h1>

                <BlocksView blocks={blocks} />
            </div>
        </DndContext>
    );
}