import { createMemoryHistory } from "history"

export default (configureStore, handler) => (
	req,
	url,
	initialState,
	callback
) => {
	try {
		// Create a history entry based on the URL of the requested page.
		const history = createMemoryHistory({
			initialEntries: [url],
			initialIndex: 0
		})

		// Create the store to use for the render.
		const store = configureStore(history, initialState)

		// Render the component.
		handler(req, url, store, history, callback)
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
