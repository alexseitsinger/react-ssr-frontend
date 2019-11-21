import React from "react"
import { createMemoryHistory } from "history"
import _ from "underscore"

const STATE_KEY = "initialState"
const URL_KEY = "url"

/**
 * @name serverBundle
 *
 * @description
 * The entry point for the server-side bundle.
 *
 * @param {object} props
 * @param {function} props.App
 * The app to render server-side.
 * @param {string} [props.urlKey=url]
 * String to use to find the requested url in the request body.
 * @param {function} [props.getUrl]
 * Method to use to get the requested url for the render.
 * @param {function} [props.getHistory]
 * Method to get the history object to use.
 * @param {string} [props.stateKey=initialState]
 * String to use to find the initial state in the DOM.
 * @param {function} [props.getState]
 * Method to get the initial state.
 * @param {function} props.getStore
 * Method to get the store to use for the render.
 * @param {function} [props.onBeforeRender]
 * Invoked before rendering a response
 * @param {function} props.render
 * The method to generate the server-side rendered app content.
 *
 * @returns {object}
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
