import React from "react"
import { Provider } from "react-redux"
import { ConnectedRouter } from "connected-react-router"

function createCompose(app) {
	function compose(store, history) {
		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>{app}</ConnectedRouter>
			</Provider>
		)
	}
	return compose
}

export default createCompose
