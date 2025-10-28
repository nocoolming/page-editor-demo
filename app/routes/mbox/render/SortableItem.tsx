import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";
import { componentStore } from "../store/ComponentStore";
import { ProcessRender } from "./ProcessRender";


export function SortableItem(props) {
    const { component, config } = props;
    if(!component){
        return <p>null</p>
    }
    // debugger;
    // const componentConfig = config.components[component.type];

    // console.log(`type: ${component.type}`)
    // console.log(JSON.stringify(component));
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: component.id,
        // category: component.category,
        transition: {
            duration: 150, // milliseconds
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }


    const processedProps = renderComponent(component);

    // debugger;
    return (
        <div
            className="px-6 py-3 my-2 border-b-black border-2"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}

        >
            <div
                onPointerDown={(e) => {
                    e.stopPropagation(); // 阻止拖拽事件
                }}
                onClick={(e) => {
                    // debugger;
                    // 阻止事件冒泡
                    e.stopPropagation();
                    e.preventDefault();
                    // console.log('Click me' + component.id + component.type);
                    // console.log(`current id: ${component.id}`)
                    componentStore.setCurrent(component);
                }}>

                <ProcessRender component={component} componentProps={processedProps} config={config} />


            </div>
        </div>
    )


    function renderComponent(componentData, depth = 0) {
        if (depth >= 10) {
            return componentData;
        }

        const componentConfig = config.components[componentData.type]
        // debugger;
        const processedProps = {};

        Object.keys(componentConfig.fields).forEach(
            fieldName => {
                const field = componentConfig.fields[fieldName];

                if (field.type === 'Container') {
                    // debugger
                    const f = component.props[fieldName];



                    const tempProps = f?.map(childData => {
                        if (!childData || childData.length === 0) {
                            return {};
                        }
                        // debugger;
                        return renderComponent(childData, depth++)
                    });
                    processedProps[fieldName] = tempProps || [];
                } else {
                    processedProps[fieldName] = componentData.props[fieldName];
                }
            }
        );

        return processedProps;
    }
}

