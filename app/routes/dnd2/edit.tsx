import { Editor } from "~/component/editor"


export default function Edit() {
    const config = {
        component: {
            TextBlock: {

            },
            ImageBlock: {

            },
            Container: {

            }
        },
    }

    return (
        <>
            <h1>Hello</h1>

            <Editor />
        </>
    )
}