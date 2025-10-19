import { observer } from "mobx-react-lite"
import { store } from "./store";
import { useState } from "react";

function CurrentForm() {
    let c = store.currentComponent;

    if (!c || !c.fields) {
        return <></>
    }

    return (
        <>
            {/* <p>{JSON.stringify(store.currentValues)}</p>
            <p>{JSON.stringify(store.currentComponent)}</p> */}

            <ol className="flex flex-col gap-3">
                {
                    Object.keys(c.fields).map(k => {
                        const o = c.fields[k];

                        // console.log(JSON.stringify(o));

                        return (
                            <li
                                key={k}
                                className="flex gap-3 px-3 py-2">

                                <label>{k}</label>
                                <input
                                    key={`${c.id}-${k}`}
                                    defaultValue={store.currentValues[k]}
                                    onChange={e => {
                                        // console.log(e.target.value);
                                        const v = {
                                            ...store.currentValues,
                                            [k]: e.target.value,
                                        }

                                        store.setCurrentValues(v);

                                    }} />
                            </li>
                        )
                    })
                }

            </ol>

            <button type='button'
                onClick={(e) => {
                    e.preventDefault();
                    // debugger;

                    const o = {
                        ...store.currentComponent,
                        props: {
                            ...store.currentComponent.props,
                            ...store.currentValues,
                        },
                    }

                    store.update(o);
                    store.setCurrent(o);
                }}
            >Save</button>
        </>
    )
}

export default observer(CurrentForm);