import { createMemoryHistory } from "history"

/**
 * @name  createRender
 * @description  The entry point for a server-side bundle.
 * @param  {function} configureStore Creates the store object.
 * @param  {Function} handler The function to invoke once the history and store objects have been created. This function will create the rendered app.
 * @return {Function} Takes arguments req, url, initialState, and callback. Returns a functions that will invoke the handler function or the callback function. Handler returns the rendered app data. Callback returns the error data.
 */
export default (configureStore, handler) => (request, callback) => {
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
		handler(request, store, history, callback)
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
