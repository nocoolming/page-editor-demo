import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";


export function SortableItem(props) {
    const { component } = props;

    // console.log(JSON.stringify(component));
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
            {...listeners}

        >
            <button type='button'
                onPointerDown={(e) => {
                    e.stopPropagation(); // 阻止拖拽事件
                }}
                onClick={(e) => {
                    // debugger;
                    // 阻止事件冒泡
                    e.stopPropagation();
                    e.preventDefault();
                    // console.log('Click me')
                }}
            >Click me {component.id}</button>
            {component.render(component.defaultProps)}
        </div>
    )
}