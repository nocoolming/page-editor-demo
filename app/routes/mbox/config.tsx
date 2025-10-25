import { nanoid } from "nanoid";
import type { Config } from "./config/type";

export const config: Config = {
    components: {
        Heading: {
            fields: {
                value: {
                    type: 'string',
                }
            },
            defaultProps: { value: 'Hello' },
            render: ({ value }) => (<h1>{value}</h1>)
        },
        Image: {
            fields: {
                alt: {
                    type: 'string',
                },
                src: {
                    type: 'string',
                }
            },
            defaultProps: { alt: 'test', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44_CQps08AJLJSkRCRR2R7fDRQNIIxOZtUw&s' },
            render: ({ alt, src }) => <img src={src} alt={alt} />
        },
        Container: {
            fields: {
                children: {
                    type: 'Container',
                }
            },
            defaultProps: {
                children: [
                    // {
                    //     id: nanoid(),
                    //     type: 'Heading',
                    //     props: {
                    //         value: "This is test in container"
                    //     },
                    // }
                ],
            },
            render: ({ children }) => <>{children}</>
        }
    }
}                   