import { observer } from "mobx-react-lite"
import Draggable from "./Draggable";
function ComponentList({ list }) {
    if (!list) {
        return <></>
    }
    return (
        <ul>
            {
                list.map(key => {
                    const id: string = `tools-${key}`;

                    return (
                        <Draggable id={id} key={key}>
                            {key}
                        </Draggable>
                    )
                })
            }
        </ul>
    )
}

export default observer(ComponentList);