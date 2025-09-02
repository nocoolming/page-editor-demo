import type { Block } from "./Block";


export function findNode(id: string, root: any): Block {
    if (!root) {
        return null;
    }

    for (const b of root) {
        if (b.id === id) {
            return b;
        }

        const result = findNode(id, b.children);

        if (result) {
            return result;
        }
    }

    return null;
}

export function removeBlock(blocks: Block[], id: string): {
    removed: Block; parentId: string | null; index: number
} | null {
    for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];

        if (b.id === id) {
            const removed = blocks.splice(i, 1)[0];

            return {
                removed,
                parentId: null,
                index: i,
            }
        }

        const result = removeBlockInChildren(b, id);
        if (result) {
            return result;
        }
    }
}

export function removeBlockInChildren(parent: Block, id: string)
    : { removed: Block; parentId: string | null; index: number } | null {
    for (let i = 0; i < parent.children.length; i++) {
        const c = parent.children[i];
        if (c.id === id) {
            const removed = parent.children.splice(i, 1)[0];
            return { removed, parentId: parent.id, index: i }
        }

        const deeper = removeBlockInChildren(c, id);
        if (deeper) {
            return deeper;
        }
    }

    return null;
}

export function insertBlock(
    blocks: Block[],
    block: Block,
    index: number,
    parentId: string): boolean {
    if (parentId === null) {
        blocks.splice(index, 0, block);
        return true;
    }

    let parent: Block = findNode(parentId, blocks);
    if (!parent) {
        return false;
    }
    block.parentId = parentId;
    parent.children.splice(index, 0, block);

    return true;
}

export function isDescendant(block: Block, id: string): boolean {
    if (!block || !block.children) {
        return false;
    }

    for (const c of block.children) {
        if (c.id === id) {
            return true;
        }
        if (isDescendant(c, id)) {
            return true;
        }
    }

    return false;
}

export function initCache(blocks: Block[], cache: any) {
    // debugger;
    for (const block of blocks) {
        cache[block.id] = block;

        if (block.children) {
            initCache(block.children, cache);
        }
    }

    return cache;
}