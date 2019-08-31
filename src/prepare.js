import React from "react"

/**
 * Wraps the App component so it uses specific props.
 *
 * @param {object} App
 * The component to wrap.
 *
 * @return {function}
 * A component using the required props.
 *
 * @example
 * import { prepared } from "@alexseitsinger/react-ssr"
 * import { App } from "./app"
 * export default prepared(App)
 */
export const prepare = App => ({ store, history, ...rest }) => (
  <App store={store} history={history} {...rest} />
)
