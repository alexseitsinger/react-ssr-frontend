import React from "react"

/**
 * @description  Wraps the app in a function. This wraooer takes the arguments store, and history. The returned function returns the app with these arguments as props.
 * @param  {Object} App The component to wrap.
 * @return {Function} Takes the arguments (store, history, ...rest). Returns the app using these as props.
 * @example
 * import React from "react"
 * import { composer } from "@alexseitsinger/react-ssr"
 *
 * import App from "./app"
 *
 * export default composer(App)
 */
export default function composer(App) {
    function ComposedApp({ store, history, ...rest }) {
        return (<App store={store} history={history} {...rest} />)
    }

    return ComposedApp
}
