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

       
    }
}

export default observer(MingEditor)