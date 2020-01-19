import React from "react"
import { createBrowserHistory } from "history"

const DOM_LOADED = "DOMContentLoaded"
const DOM_STATE_KEY = "__STATE__"

export default ({
  App,
  render,
  stateKey = DOM_STATE_KEY,
  configureStore,
}) => {
  const initialState = window[stateKey]
  delete window[stateKey]

  const browserHistory = createBrowserHistory()

  const store = configureStore(browserHistory, initialState)

  const PreparedApp = props => (
    <App
      store={store}
      routerHistory={browserHistory}
      {...props}
    />
  )

  const handleRender = () => render(PreparedApp, store, browserHistory)

  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, function onLoad() {
      handleRender()
      document.removeEventListener(DOM_LOADED, onLoad)
    })
  }
  else {
    handleRender()
  }

  return store
}
