import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";


export function SortableItem(props) {
    const { component } = props;

    console.log(component);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: component.id,
        category: component.category,
        transition: {
            duration: 150, // milliseconds
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    // debugger;
    return (
        <div
            className="px-6 py-3 border-b-black border-2"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}>
            {component.render(component.defaultProps)}
        </div>
    )
}