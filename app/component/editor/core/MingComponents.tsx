import { DraggableItem } from "../dnd/DraggableItem"


export default function MingComponents({ components }) {
    if (!components || components.length === 0) {
        return <></>
    }

    return (
        <>
            {
                components.map(
                    c => (
                        <DraggableItem id={c.title} label={c.title} />
                    )
                )
            }
        </>
    )
}