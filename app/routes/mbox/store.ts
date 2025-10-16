import { makeAutoObservable } from "mobx";



export class EditorStore {
    components = [];
    currentId: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    init(data) {
        this.components = [...data];
    }
}

export const store = new EditorStore();