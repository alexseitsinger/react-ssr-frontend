import React from "react"

function createCompose(App) {
	return (store, history) => <App store={store} history={history} />
}

export default createCompose
