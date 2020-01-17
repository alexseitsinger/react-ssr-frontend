# React-SSR (Frontend)

A webpack compiler and provider for render and serving server-side react. Expected to be used in combination with [React-SSR (Backend)](https://github.com/alexseitsinger/react-ssr-backend)

## Installation

```
yarn add @alexseitsinger/react-ssr
```

## Modules

#### browserBundle

The entry point for the client-side bundle.

```javascript
import { browserBundle } from "@alexseitsinger/react-ssr"

export const store = browserBundle({
  App,
  configureStore,
  render: (PreparedApp, store, history) => {
    hydrate(<PreparedApp />, document.getElementById("app"))
  }),
})
```

#### serverBundle

The entry point for a server-side bundle.

```javascript
import { serverBundle } from "@alexseitsinger/react-ssr"

export default serverBundle({
  App,
  configureStore,
  render: (PreparedApp, store, history, url) => {
    const html = renderToString(<PreparedApp />)
    const state = store.getState()
    return {
      html,
      state,
    }
  },
})
```

## Scripts

The script to start the compilation (development only) and provider servers.

```bash
yarn react-server [options]
```

#### Options

- address: Specify the address the server(s) should listen on. (default: 0.0.0.0)
- renderUrl: The url to use for the render endpoint. (default: /render)
- pagesPath: The path to the pages components. (default: src/app/site/pages)
- stateUrl: The url to use for getting default state. (default: /state)
- stateFileName: The name of the state file for each reducer. (default: state.json)
- statsUrl: The url to use to get the webpack stats data. (default: /stats)
- statsPath: The path to the webpack stats file. (default: dist/development/browser)
- statsFileName: The path to the webpack stats file. (default: webpack.json)
- secretKey: The secret key to use to protect requests.
- secretKeyHeaderName: The HTTP header that is used to carry the secret key.
- bundlePath: The path to find the bundle. (default: dist/development/server)
- bundleName: The name of the bundle used for server-side rendering. (default: server.js)
- allowedFiles: Files that are allowed to be read. (default: webpack.json)
- allowedFileTypes: Filetypes that are allowed to be read (default: .json)
- ignoredFile: Specific files that are not allowed to be read. (default: [])
- webpackConfig: The webpack config to use for the compilers. (default: webpack.config.js)
