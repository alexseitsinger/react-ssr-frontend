# React SSR

## Description

Front-end service for server-side rendering react apps.

## Installation

```
npm install @alexseitsinger/react-ssr
```

or

```
yarn add @alexseitsinger/react-ssr
```

## Modules

-   createCompose - (args: components) - Creates the function that returns the composed app tree to be rendered.

-   createRender - (args: compose, configureStore, handler) - Creates the render function used to render the app server-side.

-   createClient - (args: compose, configureStore, handler) - Creates the function that renders the app client-side.

## Usage

#### Create the compose function that creates your app tree.

```javascript
//
// ./compose.js
//
import React from "react"
import { createCompose } from "@alexseitsinger/react-ssr"
import App from "./app"

const compose = createCompose(App)

export default compose
```

#### Create the entry point for client-side webpack bundle.

```javascript
//
// ./client.js
//
import { createClient } from "@alexseitsinger/react-ssr"
import compose from "./compose"
import configureStore from "./store"
import ReactDOM from "react-dom"
import { loadComponents } from "loadable-components"

export const store = createClient(compose, configureStore, (app) => {
	const mountPoint = document.getElementsByTagName("main")[0]
	loadComponents().then(() => {
		ReactDOM.hydrate(app, mountPoint)
	})
})
```

#### Create the entry point for server-side webpack bundle.

```javascript
//
// ./render.js
//
import { createRender } from "@alexseitsinger/react-ssr"
import compose from "./compose"
import configureStore from "./store"
import { getLoadableState } from "loadable-components/server"
import { renderToString } from "react-dom/server"

const render = createRender(
	compose,
	configureStore,
	(req, url, store, app, callback) => {
		// Get the lazy-loaded component(s).
		getLoadableState(app).then((loadableState) => {
			// Render the HTML.
			const html = renderToString(app)

			// Get the loadable component(s) to render.
			const script = loadableState.getScriptTag()

			// Return the final state to use on the client.
			const state = store.getState()

			// Invoke the callback to pass the data to django.
			callback({
				html,
				state,
				script
			})
		})
	}
)

export default render
```

#### Create the server-side bundle using webpack.

```
./node_modules/.bin/webpack --config=your.webpack.config.js
```

#### Start the server using the server-side bundle for development.

```
./node_modules/.bin/nodemon ./node_modules/.bin/react-ssr-server \
    --port 3000 \
    --address 127.0.0.1 \
    --url /render \
    --bundle <path_to_development_bundle> \
    --secretKey THIS\_IS\_A\_SECRET\_KEY
```

#### Start the server using the server-side bundle for production.

```
node ./node_modules/.bin/react-ssr-server \
    --port 3000 \
    --address 127.0.0.1 \
    --url /render \
    --bundle <path_to_production_bundle> \
    --secretKey THIS\_IS\_A\_SECRET\_KEY
```
