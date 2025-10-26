import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { store } from "./store";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./render/SortableItem";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import type { Config } from "./config/type";
import CurrentForm from "./CurrentForm";
import ComponentList from "./ComponentList";
import type { Data } from "./config/Data";

function MingEditor({ config, data }: { config: Config, data: Data }) {
    useEffect(() => {
        const data = [];
        store.init(data);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}>
            <div className="flex flex-row gap-3">
                <div className="px-3 py-2 w-96 bg-blue-800">
                    <h2>Blocks</h2>

                    <ComponentList list={Object.keys(config.components)} />
                </div>

                <div className="flex justify-center px-2 grow h-screen">
                    <div className="flex flex-col gap-3 w-full">
                        <SortableContext
                            strategy={verticalListSortingStrategy}
                            items={store.components} >
                            <div id='root'>
                                {
                                    store.components.map(
                                        i => <SortableItem key={i.id} component={{ ...i }} config={config} />
                                    )
                                }
                            </div>
                        </SortableContext>
                    </div>
                </div>

                <div className="w-96 px-3 py-6 bg-yellow-50">
                    <h2>Form</h2>

                    <CurrentForm config={config} />
                </div>
            </div>

        </DndContext>
    )

    function handleDragEnd(event) {
        const { active, over } = event;

        console.log(`active id: ${active.id}, overId: ${over ? over.id : over}`)
        const blockName = active.id.replace('tools-', '');
        // debugger;
        if (!over) {
            // 空画布

            const c = store.getNewComponentDataInstance(blockName, config);
            const result = store.addComponentToContainer(
                store.components,
                'root',
                c,
            );

            store.init(result);
            // store.addBlock(blockName, config);
            return;
        }

        if (active.id !== over.id) {
            const targetComponent
                = store.findComponent(
                    store.components, over.id
                );

            let to: string = over.id;

            if (targetComponent.type !== 'Container') {
                to = 'root';
            }

            if (active.id.startsWith('tools-')) {
                // debugger;

                const c = store.getNewComponentDataInstance(blockName, config);
                const newData = store.addComponentToContainer(
                    store.components,
                    to,
                    c,
                );

                store.init(newData);

                return;
            }



            store.moveComponentUniversal(active.id, to);

        }

        // if (active.id !== over.id) {

        //     const overComponent = store.findComponent(store.components, over.id);
        //     console.log(JSON.stringify(overComponent));

        //     // const overComponent = 
        //     // 从工具箱拖动block到画布
        //     if (active.id.startsWith("tools-")) {
        //         const blockName = active.id.replace('tools-', '');

        //         // 直接放入container
        //         if (overComponent.type === 'Container') {

        //             store.addNewBlockToContainer(blockName, over.id, config);
        //             return;

        //         }
        //         store.addBlock(blockName, config);


        //         return;
        //     }

        //     // 这里是画面已经有的componentData instance 移动的场景

        //     // 放入container
        //     if (overComponent.type === 'Container') {
        //         store.removeBlockToContainer(active.id, over.id, config);

        //         return;
        //     }

        //     // 移动block位置 这里没有向Container移动的场景，上方已经拦截了。
        //     // 这里是根元素移动和container中components往根移动
        //     store.moveBlock(active.id, over.id);
        // }
    }
}

export default observer(MingEditor)