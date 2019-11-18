import React from "react"
import { createMemoryHistory } from "history"
import _ from "underscore"

const STATE_KEY = "initialState"
const URL_KEY = "url"

/**
 * The entry point for the server-side bundle.
 */
export default ({
  App,
  urlKey = URL_KEY,
  getUrl,
  getHistory,
  stateKey = STATE_KEY,
  getState,
  getStore,
  onBeforeRender,
  render,
}) => (request, response) => {
  try {
    const handleRender = () => {
      var url
      if (_.isFunction(getUrl)) {
        url = getUrl(request.body)
      }
      else {
        url = request.body[urlKey]
      }

      // Create a history entry based on the URL of the requested page.
      var history
      if (_.isFunction(getHistory)) {
        history = getHistory(request.body)
      }
      else {
        history = createMemoryHistory({
          initialEntries: [url],
          initialIndex: 0,
        })
      }

      var state
      if (_.isFunction(getState)) {
        state = getState(request.body)
      }
      else {
        state = request.body[stateKey]
      }

      const store = getStore(history, state)

      // Render the response
      const PreparedApp = props => (
        <App
          history={history}
          store={store}
          url={url}
          {...props}
        />
      )

      response(render(PreparedApp, store, history, url))
    }

    // If we get a function, run this before running the server rendering. This
    // can be useful if we want to run checks on the request before processing
    // it, and returning a different response if it's incorrect or unsafe.
    if (_.isFunction(onBeforeRender)) {
      onBeforeRender(request, response, handleRender)
    }
    else {
      handleRender()
    }
  }
  catch (e) {
    // Return an error object to django.
    response({
      error: {
        type: e.constructor.name,
        message: e.message,
        stack: e.stack,
      },
    })
  }
}
