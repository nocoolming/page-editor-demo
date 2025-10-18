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
import { SortableItem } from "./SortableItem";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import Draggable from "./Draggable";
import type { MingComponent } from "./type";


function Editor() {

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
                    <ul className="flex flex-col gap-3">
                        <Draggable id='tools-TextBlock'>TextBlock</Draggable>
                    </ul>
                </div>

                <div className="flex justify-center items-center grow h-screen">
                    <div className="flex flex-col gap-3">
                        <SortableContext
                            strategy={verticalListSortingStrategy}
                            items={store.components} >
                            {
                                store.components.map(
                                    i => <SortableItem key={i.id} component={{ ...i }} />
                                )
                            }
                        </SortableContext>
                    </div>
                </div>

                <div className="w-96 px-3 py-6 bg-yellow-50">

                    <h2>Form</h2>
                </div>

            </div>

        </DndContext>
    )

    function handleDragEnd(event) {
        const { active, over } = event;

        console.log(`active id: ${active.id}, orderId: ${over ? over.id : over}`)

        if (!over) {
            // 空画布
            const blockName = active.id.replace('tools-', '');
            addBlock(blockName);
            return;
        }

        if (active.id !== over.id) {
            // 从工具箱拖动block到画布
            if (active.id.startsWith("tools-")) {
                const blockName = active.id.replace('tools-', '');


                addBlock(blockName);
                return;
            }

            // 移动block位置 
            moveBlock(active.id, over.id);
        }
    }

    function addBlock(blockName: string) {
        const id = blockName + new Date().toLocaleTimeString();
        const component: MingComponent = {
            id: id,
            title: blockName,
            category: blockName,
            sort: 0,
            isContainer: false,
            fields: {
                text: {
                    type: 'string'
                }
            },
            defaultProps: {
                text: 'This is default props.',
            },
            render: ({text}) => <p>{text}</p>
        }

        store.init([
            component,
            ...
            store.components,
        ]);


    }

    function moveBlock(from: string, to: string) {
        let data = [...store.components];

        console.log(data);
        const oldIndex = data.indexOf(from);
        const newIndex = data.indexOf(to);

        console.log(`old: ${oldIndex}, new: ${newIndex}`)

        data = arrayMove(data, oldIndex, newIndex);

        console.log(data);
        store.init(data);
    }



}

export default observer(Editor);