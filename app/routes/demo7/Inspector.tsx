import { observer } from "mobx-react-lite";
import { store } from "./store";
import { blockConfigs } from "./blogConfigs";


export const Inspector = observer(() => {
    const node = store.selectedBlock;
    let c = (
        <div className="text-gray-500">
            未选择 Block
        </div>
    )

    if (node) {
        c = (
            <>
                <div className="text-sm text-gray-700 mb-2">
                    Type: {node.type}
                </div>

                {blockConfigs[node.type].fields.map((f) => (
                    <div className="mb-3" key={f.key}>
                        <label
                            className="block text-xs text-gray-600 mb-1">
                            {f.label}
                        </label>
                        <input
                            className="w-full border p-1"
                            value={node.props[f.key] ?? ''}
                            onChange={e => {
                                node.props[f.key] = e.target.value
                            }} />
                    </div>
                ))}

                <div className="mt-4">
                    <button
                        className="px-3 py-1 bg-ref-500 text-white rounded"
                        onClick={() => {
                            if (confirm('Remove this node?')) {
                                // store.
                            }
                        }}>
                        Remove
                    </button>
                </div>
            </>
        )
    }

    return (
        <div className="w-64 border bg-white">
            {c}
        </div>
    )
}
)