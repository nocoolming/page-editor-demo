import { makeAutoObservable } from "mobx";



export class EditorStore {
    components = [];
    currentId: string | null = null;
    currentComponent = null;

    constructor() {
        makeAutoObservable(this);
    }

    init(data) {
        this.components = [...data];
    }

    setCurrentId(id: string) {
        this.currentId = id;

        const o = this.components.filter(i => i.id === id);

        if (o && o.length === 1) {
            this.setCurrent(o[0]);
        } else {
            this.currentId === null;
        }
    }

    setCurrent(o) {
        this.currentComponent = o;
    }
}

export const store = new EditorStore();