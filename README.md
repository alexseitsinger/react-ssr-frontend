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
  createStore,
  render: (PreparedApp, { store, browserHistory }) => {
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
  createStore,
  render: (PreparedApp, { store, serverHistory, url }) => {
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
yarn react-server [--address <value> ...]
```

#### Options

Name                 | Description                                                               | Default           | Required
---
address              | The address the servers should listen on.                                 | 0.0.0.0           | yes
compilerPort         | The port the compiler server should use.                                  | 8081              | no
providerPort         | The port the provider server should ue.                                   | 8082              | no
browserConfig        | The path to the browser-side webpack config.                              | undefined         | yes
serverConfig         | The path to the server-side webpack config                                | undefined         | yes
renderURL            | The endpoint that provides server-side renders.                           | /render           | no
reducerDirs          | Extra paths to reducer directories within the app.                        | []                | no
appPath              | The base path to use when finding default state files.                    | ''                | yes
defaultStateURL      | The url to use for retrieving default state.                              | /defaultState     | no
defaultStateFileName | The file name to look for which contains the default state.               | defaultState.json | no
browserStatsURL      | The url to use for retrieving the current browser bundle's webpack stats. | /browserStats     | no
browserStatsPath     | The path to prepend to the browser stats file.                            | ''                | yes
browserStatsFileName | The name of the browser stats file.                                       | stats.json        | no
secretKeyValue       | The secret key value to match against when receiving requests.            | ''                | no
secretKeyHeaderName  | The name of the header that will contain the secret key.                  | 'secret-key'      | no
serverBundlePath     | The path to find the server bundle.                                       | ''                | yes
serverBundleName     | The name of the server bundle.                                            | 'server.js'       | no
allowedFiles         | Names of files that are allowed to be read.                               | ['webpack.json']  | no
ignoredFiles         | Names of files that are never allowed to be read.                         | []                | no

