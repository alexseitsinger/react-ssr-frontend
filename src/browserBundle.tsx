import React, { ElementType, ReactElement } from "react"
import { createBrowserHistory, History as BrowserHistory } from "history"
import { Store } from "redux"

import { AppProps, CreateStore } from "./types"

const DOM_LOADED = "DOMContentLoaded"
const DOM_STATE_KEY = "__STATE__"

interface BrowserRenderSettings {
  store: Store;
  browserHistory: BrowserHistory;
}

type BrowserRender = (
  PreparedApp: ElementType,
  settings: BrowserRenderSettings
) => void

interface Arguments {
  App: ElementType;
  render: BrowserRender;
  createStore: CreateStore;
  stateKey?: string;
}

export default ({
  App,
  render,
  createStore,
  stateKey = DOM_STATE_KEY,
}: Arguments): void => {
  /**
   * Collect the preloaded state from the server.
   */
  const preloadedState = window[stateKey]
  delete window[stateKey]

  /**
   * Create a new history object to use.
   */
  const browserHistory = createBrowserHistory()

  /**
   * Generate the store to use.
   */
  const store = createStore(browserHistory, preloadedState)

  /**
   * Wrap our app so it uses our created props.
   *
   * NOTE: We use the prop 'browserHistory' here to help our App component
   *       determine which Router component to use: 'ConnectedRouter'
   */
  const PreparedApp = (props: AppProps): ReactElement => (
    <App store={store} browserHistory={browserHistory} {...props} />
  )

  /**
   * Create a render handler so it returns our prepared app to the browser.
   */
  const settings: BrowserRenderSettings = { store, browserHistory }
  const handleRender = (): void => render(PreparedApp, settings)

  /**
   * When the DOM is ready, of after, render the app into it.
   */
  if (document.readyState === "loading") {
    document.addEventListener(DOM_LOADED, function onLoad() {
      handleRender()
      document.removeEventListener(DOM_LOADED, onLoad)
    })
  } else {
    handleRender()
  }
}
