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
import { SortableItem } from "./sortableItem";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";


function Editor() {

    useEffect(() => {
        const data = [1, 2, 3];
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
        </DndContext>
    )

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            // console.log(`active id: ${active.id}, orderId: ${over.id}`)
            let data = [...store.components];

            console.log(data);
            const oldIndex = data.indexOf(active.id);
            const newIndex = data.indexOf(over.id);

            console.log(`old: ${oldIndex}, new: ${newIndex}`)

            data = arrayMove(data, oldIndex, newIndex);

            console.log(data);
            store.init(data);
            // setItems((items) => {
            //     const oldIndex = items.indexOf(active.id);
            //     const newIndex = items.indexOf(over.id);

            //     return arrayMove(items, oldIndex, newIndex);
            // });
        }
    }




}

export default observer(Editor);