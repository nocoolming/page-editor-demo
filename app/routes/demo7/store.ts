import { makeAutoObservable } from "mobx";
import type { Block } from "./types";
import { get, insert, removeById } from './utils';

export class EditorStore {
    blocks: Block[] = [];
    currentId: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    add(block: Block, parentId: string | null = null) {
        if (!parentId) {
            this.blocks.push(block);
            return;

        }

        this.blocks = insert(this.blocks, parentId, -1, block);
    }

    remove(id: string) {
        const { tree } = removeById(this.blocks, id);
        this.blocks = tree;
        
        if (this.currentId === id) {
            this.currentId = null;
        }
    }

    moveBlock(blockId: string, parentId: string | null, index = -1) {
        const { tree: removedTree, removed } = removeById(this.blocks, blockId);

        if (!removed) {
            return;
        }

        this.blocks = insert(removedTree, parentId, index, removed);
    }

    select(id: string | null) {
        this.currentId = id;
    }

    get selectedBlock(): Block | null {
        return get(this.blocks, this.currentId);
    }

}

export const store = new EditorStore();