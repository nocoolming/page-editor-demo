import { makeAutoObservable } from "mobx";
import type { ComponentData } from "../config/Data";
import { nanoid } from "nanoid";
import { arrayMove } from "@dnd-kit/sortable";

export class ComponentStore {
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
        this.setCurrentValues(o.props);
    }

    setCurrentValues(v) {
        this.currentValues = v;
    }

    removeComponentFromTree(
        data: ComponentData[],
        id: string,
        deep: number = 0): {
            component: ComponentData | null,
            newData: ComponentData[]
        } {
        if (deep > 1) {
            console.log(`deep: ${deep}`);
        }

        if (deep > 20) {
            return { component: null, newData: data }
        } else {
            deep++;
        }

        if (!data || data.length === 0) {
            return { component: null, newData: [] };
        }

        let component = null;
        let newData = [...data];
        let copyData: ComponentData[] = [];

        for (const c of newData) {
            if (c.id === id) {
                component = c;
                // debugger;
                // alert(JSON.stringify(c));
                // console.log(`c: ${JSON.stringify(c)}`)
                continue;
            }

            if (c.type === 'Container') {
                // debugger;
                const result = this.removeComponentFromTree(c.props.children, id, deep);
                c.props.children = result.newData;
                if (result && result.component) {
                    component = result.component;
                }
            }

            copyData.push(c);
        }

        return { component, newData: copyData };
    }
    /**
 * 数组索引插入辅助方法
 */
    private insertAtIndex(
        array: ComponentData[],
        component: ComponentData,
        index: number
    ): ComponentData[] {
        const newArray = [...array];

        // console.log(`index: ${index}`)
        // -1 特殊处理表示末尾，其他直接用 splice
        if (index === -1) {
            newArray.push(component);
        } else {
            newArray.splice(index, 0, component);
        }

        return newArray;
    }

    addComponentToContainer(
        data: ComponentData[],
        containerId: string,
        componentToAdd: ComponentData,
        index: number = -1
    ): ComponentData[] {
        // console.log(`container id: ${containerId}`)
        if (
            !containerId ||
            containerId === 'root'
        ) {
            return this.insertAtIndex(data, componentToAdd, index);
        }

        return data.map(item => {
            if (item.id === containerId) {
                // 找到目标容器
                const currentChildren = item.props.children || [];
                const newChildren = this.insertAtIndex(currentChildren, componentToAdd, index);

                return {
                    ...item,
                    props: {
                        ...item.props,
                        children: newChildren
                    }
                };
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

    add(
        source: ComponentData[],
        fromInstance: ComponentData,
        to: String,
        postion: number = -1
    ): ComponentData[] {
        // console.log('There is add function.')

        if (!source && source.length < 0) {
            return source;
        }

        let data = [...source];

        let index: number = data.findIndex(i => i.id === to);
        console.log(JSON.stringify(data));
        console.log(`index: ${index}`);


        if (index < 0) {
            // 本级没有 遍历子
            for (let i = 0; i < data.length; i++) {
                const c = data[i]
                if (c.type === 'Container') {
                    c.props.children = this.add(
                        c.props.children,
                        fromInstance,
                        to
                    );

                    data[i] = c;
                }
            }
            return data;
        }

        // if (index === data.length - 1) {
        //     index++;
        // }
        const c = data[index];

        if (c.type === 'Container') {
            // 目标为container

            c.props.children.push(fromInstance);

            return data
        }

        if (index === 0) {
            // this.removeComponentFromTree
            data.splice(index, 0, fromInstance);
        } else if (index === data.length - 1) {
            data.splice(index + 1, 0, fromInstance);
        } else {
            data.splice(index, 0, fromInstance);
        }

        return data;
    }

    moveComponent(
        // data: ComponentData[],
        from: string,
        to: string): ComponentData[] {

        //  先判断两个是否在root的兄弟结点
        const result = this.moveSibling(
            this.components,
            from,
            to
        )

        if (result.isSibling) {
            this.components = result.data;

            return this.components;
        }

        return this.forEachTree(from, to);
    }

    forEachTree(from: string, to: string) {
        let newData = [...this.components];


        // console.log(JSON.stringify(newData));

        const result = this.findAndRemove(newData, from);

        if (!result.component) {
            // from为null
            return this.components;
        }
        newData = result.newData;

        newData = this.add(
            newData,
            result.component,
            to
        )

        this.components = newData;
        return newData;
    }

    // 移动同层兄弟节点
    moveSibling(data: ComponentData[], from: string, to: string)
        : {
            data: ComponentData[],
            isSibling: boolean
        } {
        let newData = [...data];

        const toIndex = newData.findIndex(i => i.id === to);
        const fromIndex = newData.findIndex(i => i.id === from);

        console.log(`from: ${fromIndex} to:${toIndex}`)

        let isSibling: boolean = false;

        if (fromIndex > -1 && toIndex > -1) {
            const toContainer = data[toIndex];

            // 先看目标位置 是不是容器
            if (toContainer.type === 'Container') {
                const fromContainer = data[fromIndex];

                newData.splice(fromIndex, 1);

                toContainer.props.children.push(fromContainer);


            } else {
                newData = arrayMove(newData, fromIndex, toIndex);
            }

            isSibling = true;
        }

        return {
            data: newData,
            isSibling
        };
    }

    /**
     * 在组件树中找到指定组件的位置
     * @param data 组件数据数组
     * @param targetId 要查找的组件ID
     * @param parentId 当前层级的父容器ID，根级别为 'root'
     * @returns { containerId: 容器ID, index: 在容器中的索引 }
     */
    findComponentPosition(
        data: ComponentData[],
        targetId: string,
        parentId: string = 'root'
    ): { containerId: string, index: number } | null {
        if (!data || data.length === 0) {
            return null;
        }

        console.log(`id: ${targetId}`);
        console.log(JSON.stringify(data))
        // 检查当前级别
        const currentIndex = data.findIndex(item => item.id === targetId);
        console.log(`current index: ${currentIndex}`)
        if (currentIndex !== -1) {
            return { containerId: parentId, index: currentIndex };
        }

        let toIndex = -1;
        // 递归检查容器
        const d = data.map((i, index) => {
            console.log(index);
            if (i.id === targetId) {
                debugger;
                toIndex = index;
                return i;
            }


        })

        console.log(`to index: ${toIndex}`)
        // for (const item of data) {
        //     if (item.props?.children && Array.isArray(item.props.children)) {
        //         // 递归时传入当前 item.id 作为 parentId
        //         const result = this.findComponentPosition(
        //             item.props.children,
        //             targetId,
        //             item.id
        //         );
        //         return result;

        //     }
        // }

        // return null;
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

    update(
        data: ComponentData[],
        o: ComponentData): ComponentData[] {
        if (!o) {
            return;
        }

        const d: ComponentData[] = [...data];

        const result: ComponentData[] = d.map(
            i => {
                // debugger;

                if (i.id === o.id) {
                    return {
                        ...o,
                        props: {
                            ...o.props
                        }
                    }
                } else {
                    if (i.type !== 'Container') {
                        return i;
                    }


                    const newChildren: ComponentData[]
                        = this.update(i.props.children, o);

                    console.log(JSON.stringify(newChildren));

                    return {
                        ...i,
                        props: {
                            ...i.props,
                            children: newChildren,
                        }
                    }
                }
            }
        )

        return result;
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

    findAndRemove(source: ComponentData[], id: string): {
        component: ComponentData,
        newData: ComponentData[],
    } {
        const { component, newData } = this.removeComponentFromTree(source, id);

        // console.log(`findAndRemove`)
        // console.log(JSON.stringify(newData))
        // this.components = newData;

        return {
            component,
            newData: newData,
        };
    }



}

export const componentStore = new ComponentStore();