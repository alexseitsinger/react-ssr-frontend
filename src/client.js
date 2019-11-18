import React from "react"
import { createBrowserHistory } from "history"
import _ from "underscore"

const DOM_LOADED = "DOMContentLoaded"
const DOM_STATE_KEY = "__STATE__"

/**
 * The entry point for the client-side bundle.
 *
 * @param {object} props
 * @param {function} props.App
 * @param {function} props.createStore
 * @param {function} props.render
 */
export default ({
  App,
  render,
  stateKey = DOM_STATE_KEY,
  getState,
  getHistory,
  getStore,
}) => {
  // Get the initial state from the server.
  var state
  if (_.isFunction(getState)) {
    state = getState()
  }
  else {
    state = window[stateKey]
    delete window[stateKey]
  }

  // Create a history object for the router/store
  var history
  if (_.isFunction(getHistory)) {
    history = getHistory()
  }
  else {
    history = createBrowserHistory()
  }

  // Create the store to use.
  const store = getStore(history, state)

  // Prepare our app to use certain props automatically
  const PreparedApp = props => (
    <App
      store={store}
      history={history}
      {...props}
    />
  )

  // Create afunction to render our client.
  const renderClient = () => render(PreparedApp, store, history)

  // When the DOM is loaded, render our client, then remove the event listener.
  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, function onLoad() {
      renderClient()
      document.removeEventListener(DOM_LOADED, onLoad)
    })
  }

  // Return our store that we created.
  return store
}
