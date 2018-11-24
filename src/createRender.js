import { createMemoryHistory } from "history"

function createRender(compose, configureStore, handler) {
	function render(req, url, initialState, callback) {
		try {
			// Create a history entry based on the URL of the requested page.
			const history = createMemoryHistory({
				initialEntries: [url],
				initialIndex: 0
			})

			// Create the store to use for the render.
			const store = configureStore(history, initialState)

			// Compose the app tree to render.
			const app = compose(
				store,
				history
			)

			// Render the component.
			handler(req, url, store, app, callback)
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

	return render
}

export default createRender
