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
    // console.log(JSON.stringify(cache));

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
            debugger;
            // 深拷贝 （保持纯数据结构）
            const newBlocks: Block[] = JSON.parse(JSON.stringify(prevBlocks));

            //1. ww newBlocks 中删除active节点（并拿到原位置信息）
            const removedInfo = removeBlock(newBlocks, activeId);
            if (!removedInfo) {
                // 没找到
                return prevBlocks;
            }

            const { removed, parentId, index } = removedInfo;

            // 2. 找到over节点 
            const overBlock = findNode(overId, newBlocks);
            if (!overBlock) {
                insertBlock(newBlocks, removed, index, parentId);
                return newBlocks;
            }

            // 3. 防止把节点插入到自己的子孙中
            if (isDescendant(removed, overId) || removed.id === overId) {
                // 
                return prevBlocks;
            }

            // 4.插入到overBlock.children
            overBlock.children.push(removed);

            console.log('moved', activeId, '->', overId);
            console.log('new blocks:', JSON.stringify(newBlocks, null, 2));
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