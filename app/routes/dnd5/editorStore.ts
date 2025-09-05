import { makeAutoObservable, observable } from "mobx";
import type { Block } from "./Block";


class EditorStore {
    constructor() {
        makeAutoObservable(this);
    }

    blocks: Block[] = observable.array([
        {
            id: "1",
            parentId: "root",
            type: "container",
            text: "容器 1",
            children: [
                {
                    id: "2",
                    parentId: "1",
                    type: "text",
                    text: "文本 A（在容器1里）",
                    children: [],
                },
                {
                    id: "3",
                    parentId: "1",
                    type: "image",
                    text: "图片块",
                    children: [],
                },
            ],
        },
        {
            id: "4",
            parentId: "root",
            type: "container",
            text: "容器 2",
            children: [],
        },
        {
            id: "5",
            parentId: "root",
            type: "text",
            text: "根层文本 B",
            children: [],
        },

    ], { deep: true })

    get(
        id: string,
        list: Block[] = this.blocks,
        parent: Block | null  = null
    ): {
        block: Block,
        parent: Block
    } {
        debugger;
        for (let i of list) {
            if (i.id === id) {
                return {
                    block: i,
                    parent,
                }
            }

            if (!i.children || i.children.length === 0) {
                continue;
            }
            const o = this.get(id, i.children, i);
            if (o) {               
                return o;
            }
        }
        return null;
    }

    insertToParent(
        parentId: string,
        block: Block
    ) {
        if (!block) {
            return;
        }
        if (block.id === parentId) {
            return;
        }

        if (parentId === 'root') {
            block.parentId = 'root';
            this.blocks.push(block);
            return;
        }

        const result = this.get(parentId);
        if (!result) {
            return null;
        }

        let parent = result.block;

        parent.children.push(block);
        block.parentId = parentId;
    }

    removeBlock(id: string): Block | null {
        // debugger;
        const o = this.get(id);
        if (!o) {
            return null;
        }

        const { block, parent } = o;

        if (parent) {
            const index = parent.children.findIndex(i => i.id === id);
            if (index >= 0) {
                parent.children.splice(index, 1);
            }
        } else {
            const index = this.blocks.findIndex(i => i.id === id);
            if (index >= 0) {
                this.blocks.splice(index, 1);
            }
        }

        block.parentId = '';

        return block;
    }


    moveBlockToParent(
        id: string,
        newParentId: string
    ) {

        // debugger;
        const block = this.removeBlock(id);
        if (!block) {
            return;
        }
        this.insertToParent(newParentId, block);

    }
}

export const editStore = new EditorStore();
