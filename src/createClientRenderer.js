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

  const PreparedApp = props => <App store={store} history={history} {...props} />
  const clientRenderer = () => render(PreparedApp, store, history)

  // Render the app on the client.
  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, clientRenderer)
  }

  return store
}
