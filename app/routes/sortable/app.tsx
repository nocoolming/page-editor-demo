import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';

export default function App() {
  const [items1, setItems1] = useState([1, 2, 3, ]);  
  const [items2, setItems2] = useState([4, 5, 6, ]);
  const [items3, setItems3] = useState([7, 8, 9]);

  const [containers, setContainers] = useState({
    list1: [1, 2, 3],
    list2: [4, 5, 6],
    list3: [7, 8, 9]
  });

  const allItems = [...containers.list1, ...containers.list2, ...containers.list3];


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    console.log(event);

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className='flex flex-col justify-center items-center w-screen h-screen'>
      <h1> hello dnd kit</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={allItems}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-row gap-5'>
            <SortableList items={items1} />
            <SortableList items={items2} />
            <SortableList items={items3} />
          </div>

        </SortableContext>
      </DndContext>
    </div>
  );


}

export function SortableList({ items }) {

  return (
    <div className='flex flex-col gap-5 my-5 border-2 border-fuchsia-700 rounded-3xl px-3 py-3'>

      {items.map(id => (
        <SortableItem key={id} id={id} />

      ))}
    </div>
  )
}