import React from "react"
import { createMemoryHistory } from "history"
import _ from "underscore"

const STATE_KEY = "initialState"
const URL_KEY = "url"

export default ({
  App,
  configureStore,
  render,
  urlKey = URL_KEY,
  stateKey = STATE_KEY,
}) => opts => (request, response) => {
  const url = (
    "body" in request
    && urlKey in request.body
      ? request.body[urlKey]
      : "/"
  )
  const serverHistory = createMemoryHistory({
    initialEntries: [url],
    initialIndex: 0,
  })

  const initialState = (
    "body" in request
    && stateKey in request.body
      ? request.body[stateKey]
      : {}
  )

  const store = configureStore(serverHistory, initialState)

  const PreparedApp = props => (
    <App
      history={serverHistory}
      store={store}
      url={url}
      {...props}
    />
  )

  return render(PreparedApp, store, serverHistory, url)
}
