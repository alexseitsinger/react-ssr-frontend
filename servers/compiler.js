const express = require("express")
const webpack = require("webpack")
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackHotServerMiddleware = require("webpack-hot-server-middleware")
const bodyParser = require("body-parser")

module.exports = ({
  address,
  port,
  webpackConfigPath,
}) => {
  const app = express()

  const webpackConfig = require(webpackConfigPath)
  const compiler = webpack(webpackConfig)
  const browserCompiler = compiler.compilers[0]

  app.use(bodyParser.json())

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    next()
  })

  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: webpackConfig[0].output.publicPath,
      writeToDisk: true,
      serverSideRender: true,
    })
  )
  app.use(webpackHotMiddleware(browserCompiler, {
    path: "/__webpackHot__",
    // Should be half the time of the timeout setting on client.
    heartbeat: 1000,
  }))
  app.use(webpackHotServerMiddleware(compiler, {
    chunkName: "server",
  }))

  app.listen(port, address, () => {
    console.log(`Compiler listening on http(s)://${address}:${port}`)
  })
}
