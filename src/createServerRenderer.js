import React from "react"
import { createMemoryHistory } from "history"

/**
 * The entry point for the server-side bundle.
 *
 * @param {object} props
 * @param {function} props.createStore
 * @param {function} props.render
 *
 * @example
 * export default createServerRenderer({
 *   App,
 *   createStore,
 *   render: (PreparedApp, store, history, request, response) => {
 *     const app = <PreparedApp store={store} history={history} />
 *     const html = renderToString(app)
 *     const state = store.getState()
 *     response({ html, state })
 *   },
 * })
 */
export const createServerRenderer = ({ App, createStore, render }) => (request, response) => {
  try {
    const { url, initialState } = request.body

    // Create a history entry based on the URL of the requested page.
    const history = createMemoryHistory({
      initialEntries: [url],
      initialIndex: 0,
    })

    // Create the store to use for the render.
    const store = createStore(history, initialState)

    // Render the response
    const PreparedApp = props => <App store={store} history={history} {...props} />
    render(PreparedApp, store, history, request, response)
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
