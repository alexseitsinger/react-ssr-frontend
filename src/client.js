import React from "react"
import { createBrowserHistory } from "history"
import _ from "underscore"

const DOM_LOADED = "DOMContentLoaded"
const DOM_STATE_KEY = "__STATE__"

/**
 * @name clientBundle
 *
 * @description
 * The entry point for the client-side bundle.
 *
 * @param {object} props
 * @param {function} props.App
 * The app the render
 * @param {function} props.render
 * Method used to render the app client-side
 * @param {string} [props.stateKey=__STATE__]
 * The DOM key to get the state from the server.
 * @param {function} [props.getState]
 * Method used to get the state to use for the client.
 * @param {function} [props.getHistory]
 * Used to get the history object to use for the store.
 * @param {function} props.getStore
 * Method used to get the store object to use with the client.
 *
 * @returns {object} store
 * Returns the store object used to render the app client-side.
 *
 * @example
 * export default clientBundle({
 *  App,
 *  getStore: createStore,
 *  render: (PreparedApp, store, history) => {
 *    const mountPoint = document.getElementById("app")
 *    hydrate(<PreparedApp />, mountPoint)
 *  },
 * })
 */
export default ({
  App,
  render,
  stateKey = DOM_STATE_KEY,
  getState,
  getHistory,
  getStore,
}) => {
  /**
   * Get the initial state from the server.
   */
  var state
  if (_.isFunction(getState)) {
    state = getState()
  }
  else {
    state = window[stateKey]
    delete window[stateKey]
  }

  /**
   * Create a history object for the router/store
   */
  var history
  if (_.isFunction(getHistory)) {
    history = getHistory()
  }
  else {
    history = createBrowserHistory()
  }

  // Create the store to use.
  const store = getStore(history, state)

  /**
   * Prepare our app to use certain props automatically
   */
  const PreparedApp = props => (
    <App
      store={store}
      history={history}
      {...props}
    />
  )

  const handleRender = () => render(PreparedApp, store, history)

  /**
   * When the DOM is loaded, render our client, then remove the event listener.
   */
  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, function onLoad() {
      handleRender()
      document.removeEventListener(DOM_LOADED, onLoad)
    })
  }
  else {
    handleRender()
  }

  /**
   * Return our store that we created.
   */
  return store
}
