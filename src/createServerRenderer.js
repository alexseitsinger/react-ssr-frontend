import { createMemoryHistory } from "history"

/**
 * @description  The entry point for the server-side bundle.
 * @param  {Function} createStore Creates the store object.
 * @param  {Function} render Creates the rendered app output.
 * @return {Function} Takes arugments (request, response). When invoked, will either run the render or the callback.
 * @example
 * import { renderToString } from "react-dom/server"
 * import { createServerRenderer } from "@alexseitsinger/react-ssr"
 * 
 * import createStore from "./store"
 * import composed from "./composed"
 *
 * export default createServerRenderer(createStore, (request, response, store, history) => {
 *   const app = composed({ store, history })
 *   const html = renderToString(app)
 *   const state = store.getState()
 *   response({ html, state })
 * })
 */
export default function createServerRenderer(createStore, render) {
    return function serverRenderer(request, response) {
        try {
            const { url, initialState } = request.body

            // Create a history entry based on the URL of the requested page.
            const history = createMemoryHistory({
                initialEntries: [url],
                initialIndex: 0
            })

            // Create the store to use for the render.
            const store = createStore(history, initialState)

            // Render the component.
            render(request, response, store, history)
        } catch (e) {
            // Return an error object to django.
            response({
                error: {
                    type: e.constructor.name,
                    message: e.message,
                    stack: e.stack
                }
            })
        }
    }
}
