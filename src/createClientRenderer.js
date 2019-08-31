import { createBrowserHistory } from "history"

const DOM_LOADED = "DOMContentLoaded"

/**
 * The entry point for the client-side bundle.
 *
 * @param {object} props
 * @param {function} props.getInitialState
 * The function to use to get the initial state from the server.
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
 * import { PreparedApp } from "./app"
 *
 * export const store = createClientRenderer({
 *   createStore,
 *   render: (store, history) => {
 *     const app = PreparedApp({ store, history })
 *     const mountPoint = document.getElementsByTagName("main")[0]
 *     hydrate(app, mountPoint)
 *   },
 * })
 */
export const createClientRenderer = ({
  getInitialState,
  createStore,
  render,
}) => {
  const history = createBrowserHistory()
  const store = createStore(history, getInitialState())

  const clientRenderer = () => render(store, history)

  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, function domLoadedHandler(e){
      clientRenderer()
      document.removeEventListener(DOM_LOADED, domLoadedHandler)
    }, false)
  }

  return store
}
