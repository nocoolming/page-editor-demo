

export function ProcessRender({ component, componentProps, config }) {

    const componentConfig = config.components[component.type];
    if (component.type === 'Container') {
        return (
            <div>
                {
                    component.props?.children?.map(
                        c => (
                            <>
                                <ProcessRender
                                    component={c}
                                    componentProps={c.props}
                                    config={config}
                                />
                            </>
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
