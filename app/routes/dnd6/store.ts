import { makeAutoObservable } from "mobx";
import type { Block } from "./types";
import { insertAt, removeById, getById } from "./utils";

export class EditorStore {
  blocks: Block[] = [];
  selectedId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  addBlock(block: Block, parentId: string | null = null) {
    if (!parentId) {
      this.blocks.push(block);
      return;
    }
    this.blocks = insertAt(this.blocks, parentId, -1, block);
  }

  moveBlock(blockId: string, parentId: string | null, index = -1) {
    // remove then insert
    const { tree: removedTree, removed } = removeById(this.blocks, blockId);
    if (!removed) return;
    this.blocks = insertAt(removedTree, parentId, index, removed);
  }

  removeBlock(blockId: string) {
    const { tree } = removeById(this.blocks, blockId);
    this.blocks = tree;
    if (this.selectedId === blockId) this.selectedId = null;
  }

  select(id: string | null) {
    this.selectedId = id;
  }

  get selectedBlock(): Block | null {
    return getById(this.blocks, this.selectedId);
  }
}

export const store = new EditorStore();