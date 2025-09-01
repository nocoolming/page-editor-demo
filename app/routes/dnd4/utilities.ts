import type { Block } from "./Block";


export function findNode({ id, dataset }
    : { id: string, dataset: any }): Block {
    if (!dataset) {
        return null;
    }
console.log(JSON.stringify(dataset));
    const o = dataset[id];
    return o;
}

export function removeBlock({ id, dataset }
    : { id: string, dataset: any }) {
    let o: Block = findNode({ id, dataset });

    if (!o) {
        return;
    }

    let parent = findNode({ id: o.parentId, dataset });
    
    console.log(JSON.stringify(parent));

    if (!parent || !parent.children) {
        return;
    }
    const index = parent.children.indexOf(o);
    parent.children.splice(index, 1);

    o.parentId = '';
}

export function insertBlock({ block, index, parentId, dataset }
    : { block: Block, index: number, parentId: string, dataset: any }
) {
    let parent: Block = findNode({ id: parentId, dataset });

    block.parentId = parentId;
    parent.children.splice(index, 1, block);
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