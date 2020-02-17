const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages")
const bodyParser = require("body-parser")
const express = require("express")
const webpack = require("webpack")
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackHotServerMiddleware = require("webpack-hot-server-middleware")

module.exports = ({ address, port, configs: { browser, server } }) => {
  const app = express()

  const browserConfig = require(browser)
  const serverConfig = require(server)
  const compiler = webpack([browserConfig, serverConfig])
  const browserCompiler = compiler.compilers[0]

  compiler.hooks.invalid.tap("invalid", () => {
    console.log("Compiling new bundle...")
  })

  compiler.hooks.done.tap("done", stats => {
    const rawMessages = stats.toJson({}, true)
    const messages = formatWebpackMessages(rawMessages)

    const hasErrors = messages.errors.length > 0
    const hasWarnings = messages.warnings.length > 0

    if (!hasErrors && !hasWarnings) {
      console.log("Compiled successfully.")
      // add file size measure here.
    }

    if (hasErrors) {
      console.log("Compilation failed.")
      messages.errors.forEach(e => console.log(e))
      return
    }

    if (hasWarnings) {
      console.log("Compiled with warnings.")
      messages.warnings.forEach(w => console.log(w))
    }
  })

  app.use(bodyParser.json())

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    next()
  })

  app.use(
    webpackDevMiddleware(compiler, {
      serverSideRender: true,
      logLevel: "warn",
      publicPath: browserConfig.output.publicPath,
      writeToDisk: true,
    })
  )
  app.use(
    webpackHotMiddleware(browserCompiler, {
      path: "/__webpackHot__",
      // Should be half the time of the timeout setting on client.
      heartbeat: 1000,
    })
  )
  app.use(
    webpackHotServerMiddleware(compiler, {
      chunkName: "server",
    })
  )

  app.listen(port, address, () => {
    console.log(`Compiler listening on http(s)://${address}:${port}`)
  })
}
