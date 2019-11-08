import React from "react"
import { createBrowserHistory } from "history"

const DOM_LOADED = "DOMContentLoaded"

/**
 * The entry point for the client-side bundle.
 *
 * @param {object} props
 * @param {function} props.App
 * @param {function} props.createStore
 * @param {function} props.render
 *
 * @example
 * export const store = createClientRenderer({
 *   App,
 *   createStore,
 *   render,
 *   render: (PreparedApp, store, history) => {
 *     const app = <PreparedApp store={store} history={history} />
 *     const mountPoint = document.getElementsByTagName("main")[0]
 *     hydrate(app, mountPoint)
 *   },
 * })
 */
export const createClientRenderer = ({
  App,
  createStore,
  render,
}) => {
  // Get the initial state from the server.
  const initialState = window.__STATE__
  delete window.__STATE__

  // Create a new history object and store.
  const history = createBrowserHistory()
  const store = createStore(history, initialState)

  // Render the app on the client.
  const PreparedApp = props => <App store={store} history={history} {...props} />
  const clientRenderer = () => render(PreparedApp, store, history)

  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, clientRenderer)
  }

  return store
}
