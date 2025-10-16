import { useDraggable } from "@dnd-kit/core";
import { CSS } from '@dnd-kit/utilities';

export default function Draggable(props) {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
    });
    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;



    return (
        <li
            id={props.id}
            ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {props.children}
        </li>
    )
}