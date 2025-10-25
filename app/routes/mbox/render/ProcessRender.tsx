import { SortableItem } from "./SortableItem";


export function ProcessRender({ component, componentProps, config }) {

    const componentConfig = config.components[component.type];
    if (component.type === 'Container') {
        return (
            <div className="h-full">
                {
                    component.props?.children?.map(
                        c => (
                            <SortableItem
                                key={c.id}
                                component={c}
                                componentProps={c.props}
                                config={config}
                            />
                        )
                    )
                }
            </div>
        )
    }

    return (
        <>
            {componentConfig.render(componentProps)}
        </>
    )
}
