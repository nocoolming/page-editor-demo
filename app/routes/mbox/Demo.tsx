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


function Editor() {

    useEffect(() => {
        const data = ['1', '2', '3'];
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
                <div className="flex justify-center items-center w-full h-screen">
                    <ol className="flex flex-col gap-3">
                        <SortableContext
                            strategy={verticalListSortingStrategy}
                            items={store.components} >
                            {
                                store.components.map(
                                    i => <SortableItem key={i} id={i} />
                                )
                            }
                        </SortableContext>
                    </ol>
                </div>
            </div>

        </DndContext>
    )

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            // 从工具箱拖动block到画布
            if (active.id.startsWith("tools-")) {
                const id = active.id.replace('tools-', '');

                console.log(active.id);
                store.init([
                    id + Date().toString(),
                    ...
                    store.components
                ])
                return;
            }

            // 移动block位置 
            moveBlock(active.id, over.id);
        }
    }

    function moveBlock(from: string, to: string) {
        console.log(`active id: ${from}, orderId: ${to}`)
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