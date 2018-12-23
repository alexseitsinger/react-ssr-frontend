import createBrowserHistory from "history/createBrowserHistory"
import { windowExists, documentExists } from "./utils"

function createClient(compose, configureStore, initializer) {
	if (!windowExists) {
		throw new Error("Window doesn't exist on client.")
	}
	if (!documentExists) {
		throw new Error("Document doesn't exist on client.")
	}
	// Create the store from the DOM.
	const initialState = window.__STATE__

	// Allow the state to be garbage collected.
	delete window.__STATE__

	// Create a history entry for the client.
	const history = createBrowserHistory()

	// Create the store to use.
	const store = configureStore(history, initialState)

	// Compsoe the app to use for the client.
	const app = compose(
		store,
		history
	)

	// Create a function to invoke when the DOM is ready.
	function initialize() {
		initializer(app)
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

export default createClient
