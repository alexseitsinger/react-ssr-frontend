import { createBrowserHistory } from "history"

/**
 * @description The entry point for the client-side bundle.
 * @param  {String} variable The variable to read to get the initial state from the DOM.
 * @param  {Function} createStore Creates the store object.
 * @param  {Function} render Renders the app, once the DOM is loaded.
 * @return {Object} The store used to create the app.
 * @example
 * import { hydrate } from "react-dom"
 * import { createClientRenderer } from "@alexseitsinger/react-ssr"
 *
 * import createStore from "./store"
 * import composed from "./composed"
 *
 * export const store = createClientRenderer(createStore, (store, history) => {
 *   const app = composed({ store, history })
 *   const mountPoint = document.getElementsByTagName("main")[0]
 *   hydrate(app, mountPoint)
 * })
 */
export default function createClientRenderer(variable, createStore, render){
    // If we dont get a variable passed first, swap the arguemnt positions.
    if(typeof variable === "function"){
        render = createStore
        createStore = variable
        variable = "__STATE__"
    }
	// Create the store from the DOM.
	const initialState = window[variable]
    
    // Allow the state to be garbage collected.
	delete window[variable]

	// Create a history entry for the client.
	const history = createBrowserHistory()

	// Create the store to use.
	const store = createStore(history, initialState)

	// Create a function to invoke when the DOM is ready.
	function clientRenderer() {
		render(store, history)
	}

	// When the DOM is ready, invoke the initializer.
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", clientRenderer)
	} else {
		clientRenderer()
	}

	// Return the client-side store for use elesewhere.
	return store
}
