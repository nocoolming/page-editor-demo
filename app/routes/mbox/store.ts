import { makeAutoObservable } from "mobx";



export class EditorStore {
    components = [];
    currentId: string | null = null;
    currentComponent = null;
    currentValues = {};

    constructor() {
        makeAutoObservable(this);
    }

    init(data) {
        this.components = [...data];
    }

    setCurrentId(id: string) {
        this.currentId = id;

        const o = this.components.filter(i => i.id === id);
        // debugger;
        if (o && o.length === 1) {
            this.setCurrent(o[0]);
            this.currentValues = {};
        } else {
            this.currentId === null;
        }
    }

    setCurrent(o) {
        this.currentComponent = o;
    }

    setCurrentValues(v) {
        this.currentValues = v;
    }

    // setCurrentProps(k, v) {
    //     this.currentProps = {
    //         ...this.currentProps,
    //         k: v
    //     }
    // }

    saveComponent(o) {
        this.update(o);
    }

    update(o) {
        if (!o) {
            return;
        }

        const data = [...this.components];
        const index = data.findIndex(i => i.id === o.id);

        data.splice(index, 1);
        data.push(o);

        this.components = data;
    }
}

export const store = new EditorStore();