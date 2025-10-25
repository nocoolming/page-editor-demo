import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { store } from "./store";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./render/SortableItem";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import Draggable from "./Draggable";
import type { Config, MingComponent } from "./config/type";
import { nanoid } from "nanoid";
import CurrentForm from "./CurrentForm";
import ComponentList from "./ComponentList";
import type { ComponentData, Data } from "./config/Data";
// import { config } from "./config";

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
                            {
                                store.components.map(
                                    i => <SortableItem key={i.id} component={{ ...i }} config={config} />
                                )
                            }
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
        // debugger;
        if (!over) {
            // 空画布
            const blockName = active.id.replace('tools-', '');
            store.addBlock(blockName, config);
            return;
        }

        if (active.id !== over.id) {

            const overComponent = store.findComponent(store.components, over.id);
            console.log(JSON.stringify(overComponent));

            // const overComponent = 
            // 从工具箱拖动block到画布
            if (active.id.startsWith("tools-")) {
                const blockName = active.id.replace('tools-', '');

                // 直接放入container
                if (overComponent.type === 'Container') {

                    store.addNewBlockToContainer(blockName, over.id, config);
                    return;

                }
                store.addBlock(blockName, config);


                return;
            }

            // 这里是画面已经有的componentData instance 移动的场景

            // 放入container
            if (overComponent.type === 'Container') {
                store.removeBlockToContainer(active.id, over.id, config);

                return;
            }

            // 移动block位置 
            store.moveBlock(active.id, over.id);
        }
    }





    function insertNewComponentToCotainer(activeId: string, overComponet: ComponentData) {
        // const

    }

    function moveingComponentToContainer() {

    }





}

export default observer(MingEditor)