import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';

export default function App() {
  // 统一管理所有列表的状态
  const [containers, setContainers] = useState({
    list1: [1, 2, 3],
    list2: [4, 5, 6],
    list3: [7, 8, 9]
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 获取所有项目用于 SortableContext
  const allItems = [...containers.list1, ...containers.list2, ...containers.list3];

  // 找到项目所在的容器
  function findContainer(id: number) {
    if (containers.list1.includes(id)) return 'list1';
    if (containers.list2.includes(id)) return 'list2';
    if (containers.list3.includes(id)) return 'list3';
    return null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number | string;

    console.log('Drag end:', { activeId, overId });

    // 找到源容器
    const activeContainer = findContainer(activeId);
    if (!activeContainer) return;

    // 判断目标是项目还是容器
    let overContainer: string;
    if (typeof overId === 'string' && overId.startsWith('container-')) {
      // 拖到空容器上
      overContainer = overId.replace('container-', '');
    } else {
      // 拖到其他项目上
      overContainer = findContainer(overId as number) || activeContainer;
    }

    setContainers(prev => {
      const newContainers = { ...prev };

      if (activeContainer === overContainer) {
        // 同一容器内排序
        const containerItems = [...newContainers[activeContainer as keyof typeof newContainers]];
        const activeIndex = containerItems.indexOf(activeId);
        const overIndex = containerItems.indexOf(overId as number);

        if (activeIndex !== -1 && overIndex !== -1) {
          newContainers[activeContainer as keyof typeof newContainers] = arrayMove(containerItems, activeIndex, overIndex);
        }
      } else {
        // 跨容器移动
        const sourceItems = [...newContainers[activeContainer as keyof typeof newContainers]];
        const destItems = [...newContainers[overContainer as keyof typeof newContainers]];

        // 从源容器移除
        const activeIndex = sourceItems.indexOf(activeId);
        if (activeIndex !== -1) {
          sourceItems.splice(activeIndex, 1);
          newContainers[activeContainer as keyof typeof newContainers] = sourceItems;
        }

        // 添加到目标容器
        if (typeof overId === 'string' && overId.startsWith('container-')) {
          // 拖到空容器，添加到末尾
          destItems.push(activeId);
        } else {
          // 拖到具体项目上，插入到该项目位置
          const overIndex = destItems.indexOf(overId as number);
          if (overIndex !== -1) {
            destItems.splice(overIndex, 0, activeId);
          } else {
            destItems.push(activeId);
          }
        }
        newContainers[overContainer as keyof typeof newContainers] = destItems;
      }

      return newContainers;
    });
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
            <SortableList containerId="list1" items={containers.list1} />
            <SortableList containerId="list2" items={containers.list2} />
            <SortableList containerId="list3" items={containers.list3} />
          </div>

        </SortableContext>
      </DndContext>
    </div>
  );


}

// 可投放的列表容器
function DroppableList({ containerId, children }: { containerId: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `container-${containerId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-5 my-5 border-2 rounded-3xl px-3 py-3 min-h-[200px] ${isOver ? 'border-blue-500 bg-blue-50' : 'border-fuchsia-700'
        }`}
    >
      {children}
    </div>
  );
}

export function SortableList({ containerId, items }: { containerId: string; items: number[] }) {
  return (
    <DroppableList containerId={containerId}>
      {items.map(id => (
        <SortableItem key={id} id={id} />
      ))}
      {items.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          拖拽项目到这里
        </div>
      )}
    </DroppableList>
  );
}