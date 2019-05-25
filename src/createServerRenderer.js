import { createMemoryHistory } from "history"

/**
 * @name  createServerRenderer
 * @description  The entry point for the server-side bundle.
 * @param  {Function} createStore Creates the store object.
 * @param  {Function} render Creates the rendered app output.
 * @return {Function} Takes arugments (request, response). When invoked, will either run the render or the callback.
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
