import { createBrowserHistory } from "history"

/**
 * The entry point for the client-side bundle.
 *
 * @param {object} props
 * @param {string} [props.variable=__STATE__]
 * The DOM variable to read to get the state.
 * @param {function} props.createStore
 * The function to invoke to create the store.
 * @param {function} props.render
 * The function to invoke to create the output.
 *
 * @return {object}
 * The store used to create the app.
 *
 * @example
 * import { hydrate } from "react-dom"
 * import { createClientRenderer } from "@alexseitsinger/react-ssr"
 *
 * import { createStore } from "./store"
 * import { composed } from "./composed"
 *
 * export const store = createClientRenderer({
 *   createStore,
 *   render: (store, history) => {
 *     const app = composed({ store, history })
 *     const mountPoint = document.getElementsByTagName("main")[0]
 *     hydrate(app, mountPoint)
 *   },
 * })
 */
export function createClientRenderer({
  variable = "__STATE__",
  createStore,
  render,
}) {
  // Create the store from the DOM.
  const initialState = window[variable]

  // Allow the state to be garbage collected.
  delete window[variable]

  // Create a history entry for the client.
  const history = createBrowserHistory()

  // Create the store to use.
  const store = createStore(history, initialState)

  // Create a function to invoke when the DOM is ready.
  function clientRenderer() {
    render(store, history)
  }

  // When the DOM is ready, invoke the initializer.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clientRenderer)
  }
  else {
    clientRenderer()
  }

  // Return the client-side store for use elesewhere.
  return store
}
