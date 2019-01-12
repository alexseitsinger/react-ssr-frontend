import React from "react"

/**
 * @name createCompose
 * @description  Wraps the app in a function. This wraooer takes the arguments store, and history. The returned function returns the app with these arguments as props.
 * @param  {Object} App The component tree to wrap.
 * @return {Function} Takes the arguments store, and history. Returns the app with these as props.
 */
export default (App) => (store, history) => (
	<App store={store} history={history} />
)
