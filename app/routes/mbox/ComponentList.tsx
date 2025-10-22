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

                    return (
                        <Draggable id={key}>{key}</Draggable>
                    )
                })
            }
        </ul>
    )
}

export default observer(ComponentList);