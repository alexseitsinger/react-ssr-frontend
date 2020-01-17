const express = require("express")
const webpack = require("webpack")
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackHotServerMiddleware = require("webpack-hot-server-middleware")
const bodyParser = require("body-parser")

module.exports = ({
  address,
  config,
}) => {
  const app = express()

  const webpackConfig = require(config)
  const compiler = webpack(webpackConfig)
  const clientCompiler = compiler.compilers[0]

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
  app.use(webpackHotMiddleware(clientCompiler, {
    path: "/__webpack_hmr",
    heartbeat: 1000,
  }))
  app.use(webpackHotServerMiddleware(compiler, {
    chunkName: "server",
  }))

  app.listen(8081, address, () => {
    console.log(`Compiler listening on http(s)://${address}:8081`)
  })
}
