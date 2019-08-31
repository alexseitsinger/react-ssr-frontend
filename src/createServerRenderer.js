import { createMemoryHistory } from "history"

/**
 * The entry point for the server-side bundle.
 *
 * @param {object} props
 * @param {function} props.createStore
 * The function to invoke to create the store.
 * @param {function} props.render
 * The function to invoke to render the server-side bundle output.
 *
 * @return {function}
 * Takes arugments (request, response). When invoked, will either invoke the
 * render function, passing the request, response, story and history objects as
 * arguments, or the response callback with an error object to report.
 *
 * @example
 * import { renderToString } from "react-dom/server"
 * import { createServerRenderer } from "@alexseitsinger/react-ssr"
 *
 * import { createStore } from "./store"
 * import { composed } from "./composed"
 *
 * export default createServerRenderer({
 *   createStore,
 *   render: (request, response, store, history) => {
 *     const app = composed({ store, history })
 *     const html = renderToString(app)
 *     const state = store.getState()
 *     response({ html, state })
 *   },
 * })
 */
export const createServerRenderer = ({ createStore, render }) => (request, response) => {
  try {
    const { url, initialState } = request.body

    // Create a history entry based on the URL of the requested page.
    const history = createMemoryHistory({
      initialEntries: [url],
      initialIndex: 0,
    })

    // Create the store to use for the render.
    const store = createStore(history, initialState)

    // Render the component.
    var responseCalled = false
    const handleResponse = (...args) => {
      responseCalled = true
      response(...args)
    }
    const result = render(store, history, request, handleResponse)
    if (responseCalled === false) {
      if (result) {
        response(result)
      }
      else {
        response({
          error: {
            type: "ServerRenderedNothing",
            message: "The server returned nothing.",
          },
        })
      }
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
