import { observer } from "mobx-react-lite"
import { componentStore } from "./store/ComponentStore";
import { useState } from "react";
import type { Config } from "./config/type";

function CurrentForm(
    { config, onChange }:
        {
            config: Config,
            onChange: (e) => void
        }) {
    let c = componentStore.currentComponent;

    // console.log('this is current form');
    // console.log(JSON.stringify(c));
    if (!c || !c.props) {
        return <></>
    }

    const component = config.components[c.type];

    return (
        <>
            {/* <p>{JSON.stringify(componentStore.currentValues)}</p>
            */}
            {/* <p>{JSON.stringify(componentStore.currentComponent)}</p> */}

            <ol className="flex flex-col gap-3">
                {
                    Object.keys(component.fields).map(k => {
                        const o = component.fields[k];

                        if (k === 'children') {
                            return <></>;
                        }
                        // console.log(JSON.stringify(o));

                        return (
                            <li
                                key={k}
                                className="flex gap-3 px-3 py-2">

                                <label>{k}</label>
                                <input
                                    key={`${c.id}-${k}`}
                                    defaultValue={c.props[k]}
                                    onChange={e => {
                                        // console.log(e.target.value);
                                        const v = {
                                            ...componentStore.currentValues,
                                            [k]: e.target.value,
                                        }

                                        componentStore.setCurrentValues(v);

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
                        ...componentStore.currentComponent,
                        props: {
                            ...componentStore.currentComponent.props,
                            ...componentStore.currentValues,
                        },
                    }

                    // componentStore.update(o);
                    const d = componentStore.update(componentStore.components, o);
                    // console.log(JSON.stringify(d));
                    componentStore.init(d);
                    componentStore.setCurrent(o);
                    onChange(componentStore.components)
                }}
            >Save</button>
        </>
    )
}

export default observer(CurrentForm);