<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [createClientRenderer][1]
    -   [Parameters][2]
    -   [Examples][3]
-   [createServerRenderer][4]
    -   [Parameters][5]
    -   [Examples][6]
-   [composer][7]
    -   [Parameters][8]
    -   [Examples][9]

## createClientRenderer

The entry point for the client-side bundle.

### Parameters

-   `props` **[object][10]** 
    -   `props.variable` **[string][11]** The DOM variable to read to get the state. (optional, default `__STATE__`)
    -   `props.createStore` **[function][12]** The function to invoke to create the
        store.
    -   `props.render` **[function][12]** The function to invoke to create the output.

### Examples

```javascript
import { hydrate } from "react-dom"
import { createClientRenderer } from "@alexseitsinger/react-ssr"

import createStore from "./store"
import composed from "./composed"

export const store = createClientRenderer({
  createStore,
  render: (store, history) => {
    const app = composed({ store, history })
    const mountPoint = document.getElementsByTagName("main")[0]
    hydrate(app, mountPoint)
  },
})
```

Returns **[object][10]** The store used to create the app.

## createServerRenderer

The entry point for the server-side bundle.

### Parameters

-   `props` **[object][10]** 
    -   `props.createStore` **[function][12]** The function to invoke to create the
        store.
    -   `props.render` **[function][12]** The function to invoke to render the
        server-side bundle output.

### Examples

```javascript
import { renderToString } from "react-dom/server"
import { createServerRenderer } from "@alexseitsinger/react-ssr"

import createStore from "./store"
import composed from "./composed"

export default createServerRenderer({
  createStore,
  render: (request, response, store, history) => {
    const app = composed({ store, history })
    const html = renderToString(app)
    const state = store.getState()
    response({ html, state })
  },
})
```

Returns **[function][12]** Takes arugments (request, response). When invoked, will either run the render or the callback.

## composer

Wraps the app in a function. This wraooer takes the arguments store, and history. The returned function returns the app with these arguments as props.

### Parameters

-   `App` **[object][10]** The component to wrap.

### Examples

```javascript
import React from "react"
import { composer } from "@alexseitsinger/react-ssr"

import App from "./app"

export default composer(App)
```

Returns **[function][12]** Takes the arguments (store, history, ...rest). Returns the app using these as props.

[1]: #createclientrenderer

[2]: #parameters

[3]: #examples

[4]: #createserverrenderer

[5]: #parameters-1

[6]: #examples-1

[7]: #composer

[8]: #parameters-2

[9]: #examples-2

[10]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[12]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function
