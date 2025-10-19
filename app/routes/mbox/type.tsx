import type { JSX } from "react";



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





