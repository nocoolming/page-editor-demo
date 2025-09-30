import { useDraggable } from "@dnd-kit/core";

export function PaletteItem(
    { name }:
        { name: string }
) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: `palette:${name}`,
        data: { paletteType: name },
    });


    return (
        <li
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`border  mb-2 bg-white cursor-grab ${isDragging ? "opacity-60" : ""}`}
            style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}
        >
            {name}
        </li>
    )
}
