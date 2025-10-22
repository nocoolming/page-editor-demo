import type { JSX } from "react";
import type { DefaultProps } from "./Props";



export type MingComponent = {
    id: string,
    title: string,
    category: string;
    fields: { [key: string]: any },
    defaultProps: { [key: string]: any },
    props?: { [key: string]: any },
    sort: number;
    isContainer: boolean;
    render: (props) => JSX.Element;
}

export type ComponentConfig = {
    label?: string,
    fields: { [key: string]: any },
    render: (props) => JSX.Element,
    defaultProps?: { [key: string]: any }
}


export type Config<
    Props extends DefaultProps = DefaultProps
> = {
    components: {
        [componentName in keyof Props]
        : ComponentConfig
    }
}


