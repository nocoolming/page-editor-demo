import { makeAutoObservable } from "mobx";
import type { ComponentData } from "./config/Data";
import { nanoid } from "nanoid";
import { arrayMove } from "@dnd-kit/sortable";



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

        const o = this.findComponent(this.components, id);
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
    saveComponentInAllLayoutData(data: ComponentData[], o) {
        if (!data || data.length === 0) {
            return;
        }

        const d = [...data];
        const copy = d.map(
            i => {
                if (i.id === o.id) {
                    const index = d.findIndex(j => j.id === o.id);
                    // debugger;
                    d.splice(index, 1)
                    d.splice(index, 0, { ...o })
                    return o;
                } else {
                    i.props.children = this.saveComponentInAllLayoutData(i.props.children, o);

                    return i;
                }
            }
        )

        console.log(`copy === d ${(copy.length)}, ${JSON.stringify(copy)}`)

        return copy;
    }

    getNewComponentDataInstance(type: string, config) {
        const id: string = nanoid();

        const componentConfig = config.components[type];

        const c: ComponentData = {
            id,
            type,
            props: componentConfig.defaultProps,
        }

        return c;

    }

    addBlock(type: string, config) {
        const component: ComponentData = this.getNewComponentDataInstance(type, config);

        this.init([
            component,
            ...
            store.components,
        ]);
    }

    // moveComponentToContainer(c: ComponentData, )

    addNewBlockToContainer(type: string, containerId: string, config) {
        // copy data
        const d = [...this.components];

        if (!d || d.length <= 0) {
            return;
        }

        const c = this.getNewComponentDataInstance(type, config);

        const parent = this.findComponent(this.components, containerId);
        if (!parent) {
            return;
        }

        parent.props.children.push(c);
    }

    removeBlockToContainer(id: string, parentId: string, config) {
        // copy data
        const d = [...this.components];

        if (!d || d.length <= 0) {
            return;
        }



        const c = this.removeAndFindComponent(this.components, id);
        if (!parentId
            || parentId === 'root') {
            this.addBlock(c.type, config);
            return;
        }

        const parent = this.findComponent(this.components, parentId);
        if (!parent) {
            return;
        }

        parent.props.children.push(c);
    }

    removeAndFindComponent(
        data: ComponentData[],
        id: string) {
        if (!data || data.length <= 0) {
            return;
        }

        const index = data.findIndex(i => i.id === id);
        if (index >= 0) {
            const reuslt = data[index];
            data.splice(index, 1);
            return reuslt;
        } else {
            data.map(
                d => this.removeAndFindComponent(d.props?.children?.id, id)
            );
        }

        return null;
    }

    moveBlock(from: string, to: string) {
        let data = [...store.components];

        // console.log(JSON.stringify(data));
        const oldIndex = data.findIndex(i => i.id === from);
        const newIndex = data.findIndex(i => i.id === to);

        console.log(`old: ${oldIndex}, new: ${newIndex}`)

        data = arrayMove(data, oldIndex, newIndex);

        // console.log(JSON.stringify(data));
        this.init(data);
    }

    update(o) {
        if (!o) {
            return;
        }

        const data = [...this.components];
        const index = data.findIndex(i => i.id === o.id);

        data.splice(index, 1);
        data.splice(index, 0, o);

        this.components = data;
    }

    findComponent(source: ComponentData[], id: string) {
        if (!source || source.length === 0) {
            return null;
        }

        const result = source.filter(i => {
            if (i.id === id) {
                return i;
            }

            if (i.props
                && i.props?.children
                && i.props?.children.length > 0) {
                return this.findComponent(i.props.children, id);
            }
        });

        if (result && result.length > 0) {
            return result[0];
        }

        return null;

    }



}

export const store = new EditorStore();