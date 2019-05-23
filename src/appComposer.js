import React from "react"

/**
 * @name appComposer
 * @description  Wraps the app in a function. This wraooer takes the arguments store, and history. The returned function returns the app with these arguments as props.
 * @param  {Object} App The component to wrap.
 * @return {Function} Takes the arguments (store, history, ...rest). Returns the app using these as props.
 */
export default (App) => ({ store, history, ...rest }) => (
	<App store={store} history={history} {...rest} />
)
