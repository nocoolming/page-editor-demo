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
            defaultProps: { alt: '', src: '' },
            render: ({ alt, src }) => <img src={src} alt={alt} />
        }
    }
}