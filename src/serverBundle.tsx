import React, { ElementType, ReactElement } from "react"
import { Request as ExpressRequest } from "express"
import { createMemoryHistory, MemoryHistory } from "history"
import { Store } from "redux"

import { AppProps, CreateStore, ExpressHandler, FirstHandler } from "./types"

const STATE_KEY = "initialState"
const URL_KEY = "url"

interface ServerRenderSettings {
  store: Store;
  serverHistory: MemoryHistory;
  url: string;
}
type ServerRender = (
  PreparedApp: ElementType,
  settings: ServerRenderSettings
) => void

interface Arguments {
  App: ElementType;
  createStore: CreateStore;
  render: ServerRender;
  urlKey?: string;
  stateKey?: string;
}

export default ({
  App,
  createStore,
  render,
  urlKey = URL_KEY,
  stateKey = STATE_KEY,
}: Arguments): FirstHandler => (): ExpressHandler => (
  request: ExpressRequest
): void => {
  /**
   * Get the url to start rendering for.
   */
  let url = "/"
  if (typeof request.body[urlKey] !== "undefined") {
    url = request.body[urlKey]
  }

  /**
   * Create a history object for the store/router.
   */
  const serverHistory = createMemoryHistory({
    initialEntries: [url],
    initialIndex: 0,
  })

  /**
   * Generate the initial state to use for the store.
   */
  let initialState = {}
  if (typeof request.body[stateKey] !== "undefined") {
    initialState = request.body[stateKey]
  }

  /**
   * Generate the store to use.
   */
  const store = createStore(serverHistory, initialState)

  /**
   * Wrap the provided app so it uses certain props automatically.
   *
   * NOTE: We use the 'serverHistory' prop, rather than 'browserHistory' to tell
   *       our App component which router to use: StaticRouter.
   */
  const PreparedApp = (props: AppProps): ReactElement => (
    <App serverHistory={serverHistory} store={store} url={url} {...props} />
  )

  /**
   * Invoke the provded render() function using our prepared data to return it
   * back to the server for the HTTP response.
   */
  const settings: ServerRenderSettings = { store, serverHistory, url }
  return render(PreparedApp, settings)
}
