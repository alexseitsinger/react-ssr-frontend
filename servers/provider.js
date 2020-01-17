const express = require("express")
const bodyParser = require("body-parser")

const createRenderHandler = require("../handlers/render")
const createStatsHandler = require("../handlers/stats")
const createStateHandler = require("../handlers/state")

module.exports = ({
  address,
  render,
  state,
  stats,
}) => {
  const renderHandler = createRenderHandler(render)
  const statsHandler = createStatsHandler(stats)
  const stateHandler = createStateHandler(state)

  const app = express()
  app.use(bodyParser.json())
  app.post(render.url, renderHandler)
  app.get(`${state.url}/:reducerName`, stateHandler)
  app.get(stats.url, statsHandler)
  app.listen(8082, address, () => {
    console.log(`Provider listening on http(s)://${address}:8082`)
  })
}

