import { observer } from "mobx-react-lite"
import { store } from "./store";
import { useState } from "react";
import type { Config } from "./config/type";

function CurrentForm({ config }: { config: Config }) {
    let c = store.currentComponent;

    console.log('this is current form');
    console.log(JSON.stringify(c));
    if (!c || !c.props) {
        return <></>
    }

    

    const component = config.components[c.type];

    return (
        <>
            {/* <p>{JSON.stringify(store.currentValues)}</p>
            <p>{JSON.stringify(store.currentComponent)}</p> */}

            <ol className="flex flex-col gap-3">
                {
                    Object.keys(component.fields).map(k => {
                        const o = component.fields[k];

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