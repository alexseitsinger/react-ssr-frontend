import { createMemoryHistory } from "history"

/**
 * @name  serverRender
 * @description  The entry point for the server-side bundle.
 * @param  {Function} configureStore Creates the store object.
 * @param  {Function} render Creates the rendered app output.
 * @return {Function} Takes arugments (request, callback). When invoked, will either run the render or the callback.
 */
export default (configureStore, render) => (request, callback) => {
	try {
		const { url, initialState } = request.body

		// Create a history entry based on the URL of the requested page.
		const history = createMemoryHistory({
			initialEntries: [url],
			initialIndex: 0
		})

		// Create the store to use for the render.
		const store = configureStore(history, initialState)

		// Render the component.
		render(request, store, history, callback)
	} catch (e) {
		// Return an error object to django.
		callback({
			error: {
				type: e.constructor.name,
				message: e.message,
				stack: e.stack
			}
		})
	}
}
