import { observer } from "mobx-react-lite";
import type { Block } from "./types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { blockConfigs } from "./blogConfigs";
import { store } from "./store";


export const EditorBlock = observer(function EditorBlock({ block }: { block: Block }) {
    // draggable

    console.log(JSON.stringify(block));
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: block.id,
        type: block.type
    })

    // container drop area when acceptsChildren === true
    const containerDropId = `container:${block.id}`;
    const accepts = blockConfigs[block.type].acceptsChildren ?? false;
    const {
        setNodeRef: setContainerDropRef,
        isOver: isOverContainer }
        = useDroppable({
            id: containerDropId,
            disabled: !accepts,
        });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: transform ?
                    `translate(${transform.x}px, ${transform.y}px)`
                    : undefined
            }}
            onPointerDown={e => {
                // 立即选中，阻止事件冒泡到root 清空
                e.stopPropagation();
                store.select(block.id);
            }}
            className={
                ` rounded 
                    ${store.currentId === block.id ?
                    "ring-2 ring-blue-400"
                    : "border border-gray-200"}
                        ${isDragging ? "opacity-60" : "bg-white"}
                    `
            }
        >
            <div>
                {/* 渲染主体 */}
                {
                    blockConfigs[block.type].render(
                        block.props,
                        block.children.map(c => <EditorBlock key={c.id} block={c} />)
                    )
                }
            </div>

            {
                accepts && (
                    <div
                        ref={setContainerDropRef}
                        className={
                            `mt-2 rounded border-2 
                                ${isOverContainer ?
                                "border-blue-400 bg-blue-50"
                                : "border-dashed border-gray-300 bg-white"
                            }
                            `
                        }
                    >
                        {/* children are rendered above */}
                    </div>
                )
            }

        </div>
    )
})