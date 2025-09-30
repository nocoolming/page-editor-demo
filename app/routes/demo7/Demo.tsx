import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    type DragEndEvent,
} from '@dnd-kit/core';
import { PaletteItem } from './PaletteItem';
import type { Block } from './types';
import {
    findParentAndIndex,
    insert,
    isDescendant,
    removeById,
    uid
} from './utils';
import { store } from './store';
import { DropAreaRoot } from './DropAreaRoot';
import { EditorBlock } from './EditorBlock';
import { observer } from 'mobx-react-lite';

const App = observer(function App() {
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;


        if (!active) {
            return;
        }

        // console.log(`active: ${JSON.stringify(active)}`);
        // console.log(`over: ${JSON.stringify(over)}`)

        const activeId = String(active.id);
        const overId = over ? String(over.id) : null;


        console.log(`activeId: ${activeId}, overId: ${overId}`)

        // debugger;

        if (activeId.startsWith('palette:') && overId) {
            const type = activeId.replace('palette:', '');

            const block: Block = {
                id: uid(),
                type,
                props: blockFactory(type),
                defaultProps: null,
                parentId: null,
                children: [],
            }


            if (overId === 'root') {
                return addBlock(block, overId);
            }

            // dorp some item -> 插入到该item前面（同级）
            dropSomeItem(block, overId);

            // existing block move (drag activeId is block.id)
            moveBlockToNewPosition(activeId, overId);

            return;
        }

    }

    function addBlock(block: Block, overId: string) {

        // drop to root
        if (overId === 'root') {
            store.add(block, null);

            return;
        }

        // drop to cotainer area
        if (overId.startsWith("container:")) {
            const pid = overId.replace("container:", "");
            store.add(block, pid);
            return;
        }

        // drop to container area
        if (overId.startsWith("container:")) {
            const pid = overId.replace("container:", '');
            store.add(block, pid);
            return;
        }

    }


    function dropSomeItem(block: Block, overId: string) {
        const parentInfo = findParentAndIndex(store.blocks, overId);

        let parentId = null;
        let index = -1
        if (parentInfo) {
            parentId = parentInfo.parentId;
            index = parentInfo.index;
        }

        store.add(block, parentId);

        // then move to position if index >= 0 (we just appended; adjust)
        if (index >= 0) {
            //remove appended and insert at position:
            const {
                tree: removedTree,
                removed
            } = removeById(store.blocks, block.id);

            if (removed) {
                store.blocks = insert(removedTree, parentId, index, removed);
            }

            return;
        }

    }

    function moveBlockToNewPosition(activeId: string, overId: string) {
        const movingId = activeId;

        // prevent drop onto itself
        if (movingId === overId) {
            return;
        }

        // drop to root
        if (overId === 'root') {
            store.moveBlock(movingId, null);
            return;
        }

        // drop to container area
        if (overId.startsWith('container:')) {
            const pid = overId.replace('container:', '');
            // prevent dropping into its own descendant
            if (isDescendant(store.blocks, movingId, pid)) {
                return;
            }
            store.moveBlock(movingId, pid);
            return;
        }

        // drop on an item -> insert before it on same parent
        const where = findParentAndIndex(store.blocks, overId);
        if (!where) {
            return;
        }

        if (isDescendant(store.blocks, movingId, where.parentId ?? '')) {
            return;
        }

        // move and place before index
        store.moveBlock(movingId, where.parentId);

        // No adjust order: remove then insert at index
        const {
            tree: removedTree,
            removed
        } = removeById(store.blocks, movingId);
        if (removed) {
            store.blocks =
                insert(
                    removedTree,
                    where.parentId,
                    where.index,
                    removed
                );
        }
    }

    function blockFactory(type: string) {
        switch (type) {
            case 'Text': {
                return {
                    text: 'hello',
                }
            }
            case 'Image': {
                return {
                    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5116TDzM1UxPIFzhYm1pc147Er5VK9ZZ0iw&s',
                    alt: 'test',
                }
            }
                defualt: {
                    return {}
                }
        }
    }

    return (
        < DndContext
            // sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className='flex flex-row gap-3 min-h-screen bg-gray-50'>
                {/* 左侧： 固定宽度 */}
                <div className='w-48 border bg-white p-3'>
                    <h2 className='font-semibold mb-3'>
                        Blocks</h2>

                    <ul className='space-y-2'>
                        <PaletteItem name={"Text"} />
                        <PaletteItem name="Image" />
                        <PaletteItem name="Container" />
                    </ul>
                </div>

                {/* 中间填充 */}
                <div className='flex-1'>
                    <DropAreaRoot>
                        <>
                            {
                                store.blocks.map(b => (
                                    <EditorBlock key={b.id} block={b} />
                                ))
                            }
                        </>
                    </DropAreaRoot>
                </div>

                {/* 右侧： 固定宽度  */}

            </div>
            {/* <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
            >
                <BlockList blocks={ids} />
            </SortableContext> */}
        </DndContext >

    );
});

export default App;