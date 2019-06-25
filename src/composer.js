import React from "react"

/**
 * Wraps the component with another component.
 *
 * @param {object} App
 * The component to wrap.
 *
 * @return {function}
 * A component using the required props.
 *
 * @example
 * import React from "react"
 * import { composer } from "@alexseitsinger/react-ssr"
 *
 * import App from "./app"
 *
 * export default composer(App)
 */
export function composer(App) {
  function ComposedApp({ store, history, ...rest }) {
    return (<App store={store} history={history} {...rest} />)
  }

  return ComposedApp
}
