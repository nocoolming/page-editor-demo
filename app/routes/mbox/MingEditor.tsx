import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { componentStore } from "./store/ComponentStore";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./render/SortableItem";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import type { Config } from "./config/type";
import CurrentForm from "./CurrentForm";
import ComponentList from "./ComponentList";
import type { ComponentData, Data } from "./config/Data";

function MingEditor({ config, data, onChange }
    : {
        config: Config,
        data: Data,
        onChange: (e) => void
    }) {
    useEffect(() => {
        componentStore.init(data.body || []);
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
                            items={componentStore.components} >
                            <div id='root'>
                                {
                                    componentStore.components.map(
                                        i => <SortableItem key={i.id} component={{ ...i }} config={config} />
                                    )
                                }
                            </div>
                        </SortableContext>
                    </div>
                </div>

                <div className="w-96 px-3 py-6 bg-yellow-50">
                    <h2>Form</h2>

                    <CurrentForm
                        config={config}
                        onChange={e => onChange({
                            ...data,
                            body: componentStore.components
                        })} />
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

            const c = componentStore.getNewComponentDataInstance(blockName, config);
            const result = componentStore.addComponentToContainer(
                componentStore.components,
                'root',
                c,
            );

            componentStore.init(result);

            const d = {
                ...data,
                body: componentStore.components
            }

            console.log(JSON.stringify(d));

            onChange(d)
            // store.addBlock(blockName, config);
            return;
        }

        if (active.id !== over.id) {
            const targetComponent
                = componentStore.findComponent(
                    componentStore.components, over.id
                );

            if (active.id.startsWith('tools-')) {
                // debugger;

                const c = componentStore.getNewComponentDataInstance(blockName, config);

                const newData = componentStore.add(
                    componentStore.components,
                    c,
                    over.id
                );

                componentStore.init(newData);
                // const newData = componentStore.addComponentToContainer(
                //     componentStore.components,
                //     containerId,
                //     c,
                // );

                // console.log(newData);
                // componentStore.init(newData);

                onChange({
                    ...data,
                    body: componentStore.components
                })
                return;
            }

            componentStore.moveComponent(active.id, over.id);
            // componentStore.init(d);
            // console.log(JSON.stringify(d));


            // console.log(JSON.stringify(componentStore.components));

        }


    }
}

export default observer(MingEditor)