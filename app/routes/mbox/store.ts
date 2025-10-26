import { makeAutoObservable } from "mobx";
import type { ComponentData } from "./config/Data";
import { nanoid } from "nanoid";

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


    removeComponentFromTree(data: ComponentData[], id: string)
        : {
            component: ComponentData | null,
            newData: ComponentData[]
        } {
        if (!data || data.length === 0) {
            return {
                component: null,
                newData: []
            }
        }


        const newData: ComponentData[] = [];
        let removedComponent: ComponentData | null = null;

        for (const item of data) {
            if (item.id === id) {
                removedComponent = item;
            } else {
                const newItem = { ...item };

                if (item.props?.children && Array.isArray(item.props.children)) {
                    // 递归处理children
                    const childResult = this.removeComponentFromTree(item.props.children, id);

                    // 更新children为处理后的结果
                    newItem.props = {
                        ...item.props,
                        children: childResult.newData,
                    };

                    // 如果在children中找到了目标组件，记录它
                    if (childResult.component) {
                        removedComponent = childResult.component;
                    }
                }

                newData.push(newItem);
            }
        }

        return { component: removedComponent, newData };
    }

    addComponentToContainer(
        data: ComponentData[],
        containerId: string,
        componentToAdd: ComponentData
    ): ComponentData[] {
        console.log(`container id: ${containerId}`)
        if (
            !containerId ||
            containerId === 'root'
        ) {
            return [...data, componentToAdd]
        }

        return data.map(item => {
            if (item.id === containerId) {
                // 找到目标容器
                return {
                    ...item,
                    props: {
                        ...item.props,
                        children: [
                            ...(item.props.children || [])
                            , componentToAdd
                        ]
                    }
                }
            } if (item.props?.children) {
                // 递归处理children
                return {
                    ...item,
                    props: {
                        ...item.props,
                        children: this.addComponentToContainer(
                            item.props.children,
                            containerId,
                            componentToAdd,
                        )
                    }
                }
            }

            return item;
        })

    }

    moveComponentUniversal(fromId: string, to: string) {
        // 1. 移除组件
        const removeResult = this.removeComponentFromTree(this.components, fromId);

        if (!removeResult.component) {
            return;
        }

        const newData = this.addComponentToContainer(
            removeResult.newData,
            to,
            removeResult.component,
        );

        this.components = newData;
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