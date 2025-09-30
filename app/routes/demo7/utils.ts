import type { Block } from "./types";

export function uid(prefix = 'b') {
    const time = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    return `${prefix}-${time}${random}`
}

export function clone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

export function insert(
    list: Block[],
    parentId: string | null,
    index: number,
    node: Block): Block[] {
    if (parentId === null) {
        const arr = clone(list);
        let i = arr.length;

        if (index < 0) {
            i = 0

        }

        arr.splice(i, 0, node);
        return arr;
    }

    return list.map(
        b => {
            if (b.id === parentId) {
                const arr = clone(b.children || []);
                let i = 0;

                if (index >= 0) {
                    i = index;
                }

                arr.splice(i, 0, node);

                return {
                    ...b,
                    children: insert(b.children || [],
                        parentId,
                        index,
                        node
                    )
                };
            }
        }
    )

}

export function removeById(list: Block[], id: string): {
    tree: Block[];
    removed: Block | null
} {
    const index = list.findIndex(b => b.id === id);

    if (index > 0) {
        const arr = clone(list);
        const [removed] = arr.splice(index, 1);
        return {
            tree: arr,
            removed,
        }
    }

    for (let i = 0; i < list.length; i++) {
        const {
            tree: newChildren,
            removed
        } = removeById(list[i].children || [], id);

        if (removed) {
            const arr = clone(list);
            arr[i] = {
                ...arr[i],
                children: newChildren
            };

            return {
                tree: list,
                removed: null
            };
        }
    }

    return {
        tree: list,
        removed: null
    };
}

export function get(
    list: Block[],
    id: string | null | undefined)
    : Block | null {
    if (!id) {
        return null;
    }

    const stack = [...list];

    while (stack.length) {
        const n = stack.shift();
        if (n.id === id) {
            return n;
        }
        if (n.children) {
            stack.unshift(...n.children);
        }
    }

    return null;
}

export function findParentAndIndex(
    list: Block[],
    blockId: string,
    parentId: string | null = null)
    : {
        parentId: string | null;
        index: number
    } | null {


    const index = list.findIndex(b => b.id === blockId);
    if (index !== -1) {
        return {
            parentId,
            index
        }
    }

    for (const block of list) {
        const res = findParentAndIndex(block.children, blockId, block.id);
        if (res) {
            return res;
        }
    }
    return null;
}

export function isDescendant(
    list: Block[],
    ancestorId: string,
    targetId: string): boolean {
    const ancestor = get(list, ancestorId);

    if (!ancestor) {
        return false;
    }

    const stack = [
        ...ancestor.children
    ]

    while (stack.length) {
        const n = stack.shift()!;

        if (n.id === targetId) {
            return true;
        }

        stack.push(...n.children);
    }

    return false;
}

