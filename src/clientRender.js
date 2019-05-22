import { createBrowserHistory } from "history"

/**
 * @name clientRender
 * @description The entry point for the client-side bundle.
 * @param  {Function} configureStore Creates the store object.
 * @param  {Function} render Renders the app, once the DOM is loaded.
 * @return {Object} The store used to create the app.
 */
export default (configureStore, render) => {
	// Create the store from the DOM.
	const initialState = window.__STATE__

	// Allow the state to be garbage collected.
	delete window.__STATE__

	// Create a history entry for the client.
	const history = createBrowserHistory()

	// Create the store to use.
	const store = configureStore(history, initialState)

	// Create a function to invoke when the DOM is ready.
	function initialize() {
		render(store, history)
	}

	// When the DOM is ready, invoke the initializer.
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize)
	} else {
		initialize()
	}

	// Return the client-side store for use elesewhere.
	return store
}
