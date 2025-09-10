// --------------------------
// DemoMobX.tsx
// --------------------------
import React from "react";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --------------------------
// 类型定义
// --------------------------
export interface Block {
  id: string;
  type: string;
  content: string;
}

export interface ContainerData {
  id: string;
  blocks: Block[];
}

export interface DemoProps {
  config?: any;
  data?: ContainerData[];
}

// --------------------------
// MobX Store
// --------------------------
class EditorStore {
  containers: ContainerData[] = [];
  config: any = {};

  constructor(defaultData: ContainerData[], defaultConfig: any) {
    this.containers = defaultData;
    this.config = defaultConfig;
    makeAutoObservable(this);
  }

  setContainers(containers: ContainerData[]) {
    this.containers = containers;
  }

  updateBlockOrder(containerId: string, oldIndex: number, newIndex: number) {
    const container = this.containers.find((c) => c.id === containerId);
    if (!container) return;
    container.blocks = arrayMove(container.blocks, oldIndex, newIndex);
  }
}

// --------------------------
// 默认值
// --------------------------
const defaultData: ContainerData[] = [
  {
    id: "container-1",
    blocks: [
      { id: "block-1", type: "text", content: "默认 Block 1" },
      { id: "block-2", type: "text", content: "默认 Block 2" },
    ],
  },
  {
    id: "container-2",
    blocks: [
      { id: "block-3", type: "text", content: "默认 Block 3" },
      { id: "block-4", type: "text", content: "默认 Block 4" },
    ],
  },
];

const defaultConfig = { showBlockId: true };

// --------------------------
// 可排序 Block 组件
// --------------------------
const SortableBlock = observer(
  ({ block, config }: { block: Block; config: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: block.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      padding: "8px",
      margin: "4px 0",
      border: "1px solid #ccc",
      borderRadius: "4px",
      background: "#f9f9f9",
      cursor: "grab",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {block.content}
        {config.showBlockId && ` (${block.id})`}
      </div>
    );
  }
);

// --------------------------
// Container 组件
// --------------------------
const Container = observer(
  ({
    container,
    store,
  }: {
    container: ContainerData;
    store: EditorStore;
  }) => {
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const oldIndex = container.blocks.findIndex((b) => b.id === active.id);
      const newIndex = container.blocks.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      store.updateBlockOrder(container.id, oldIndex, newIndex);
    };

    return (
      <div
        style={{
          border: "2px solid #333",
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "16px",
        }}
      >
        <h4>Container: {container.id}</h4>
        <DndContext
          sensors={useSensors(useSensor(PointerSensor))}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={container.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {container.blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                config={store.config}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    );
  }
);

// --------------------------
// 主组件
// --------------------------
export const DemoMobX = observer(({ config, data }: DemoProps) => {
  // 初始化 store，外部传入优先，否则用默认值
  const store = React.useMemo(
    () =>
      new EditorStore(data ?? defaultData, {
        ...defaultConfig,
        ...(config ?? {}),
      }),
    [config, data]
  );

  return (
    <div style={{ display: "flex", gap: "16px", padding: "16px" }}>
      {/* 左侧 Field Form */}
      <div style={{ flex: 1 }}>
        <h3>Field Form (只读)</h3>
        <pre>{JSON.stringify(store.containers, null, 2)}</pre>
      </div>

      {/* 右侧 Main 区域 */}
      <div style={{ flex: 2 }}>
        {store.containers?.map((container) => (
          <Container key={container.id} container={container} store={store} />
        ))}
      </div>
    </div>
  );
});

// --------------------------
// 使用示例
// --------------------------
// <DemoMobX
//    config={{ showBlockId: false }}
//    data={[
//      { id: "c1", blocks: [{ id: "b1", type: "text", content: "自定义 Block" }] },
//    ]}
// />
