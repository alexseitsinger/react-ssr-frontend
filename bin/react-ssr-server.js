#!/usr/bin/env node

const fs = require("fs")

const path = require("path")
const yargs = require("yargs")
const express = require("express")
const bodyParser = require("body-parser")

const {
  configure,
  setNoCacheHeaders,
  getFirstExistingFile,
  logMessage,
} = require("../utils")

// Capture the options
yargs
  .option("address", {
    describe: "Specify the servers address",
    default: "0.0.0.0",
    string: true,
  })
  .option("port", {
    describe: "Specify the servers port",
    default: 3000,
    number: true,
  })
  .option("renderUrl", {
    describe: "The url to use for the render endpoint",
    default: "/render",
    string: true,
  })
  .option("pagesPath", {
    describe: "The path the pages components.",
    default: "src/pages",
    string: true,
  })
  .option("stateUrl", {
    describe: "The url to use for getting default state.",
    default: "/state",
    string: true,
  })
  .option("statePath", {
    describe: "The path to use for finding default state file of reducer.",
    default: "src/reducers",
    string: true,
  })
  .option("stateFileName", {
    describe: "The name of the state file for each reducer.",
    default: "state.json",
    string: true,
  })
  .option("statsUrl", {
    describe: "The url to to use to get webpack stats data.",
    default: "/stats",
    string: true,
  })
  .option("statsPath", {
    describe: "The path to the webpack stats file.",
    default: "",
    string: true,
  })
  .option("statsFileName", {
    describe: "The name of the webpack stats file.",
    default: "webpack-stats",
    string: true,
  })
  .option("secretKey", {
    describe: "The secret key to use to protect requests.",
    string: true,
  })
  .option("secretKeyHeaderName", {
    describe: "The HTTP header that is used for the secret key.",
    default: "secret-key",
    string: true,
  })
  .option("bundlePath", {
    describe: "The path to find the bundle.",
    default: "bundles/server/development",
    string: true,
  })
  .option("bundleName", {
    describe: "The name of the bundle used for server-side rendering.",
    default: "server.js",
    string: true,
  })
  .option("allowedFiles", {
    describe: "Files that are allowed to be read.",
    default: [],
    array: true,
  })
  .option("allowedFiletypes", {
    describe: "Filetypes that are allowed to be read.",
    default: [],
    array: true,
  })
  .option("ignoredFiles", {
    describe: "Files that are never allowed to be read.",
    default: [],
    array: true,
  })
  .help("h")
  .alias("h", "help")
  .strict()

// Create the variables
const {
  address,
  port,
  renderUrl,
  stateUrl,
  statePath,
  stateFileName,
  statsUrl,
  statsPath,
  statsFileName,
  pagesPath,
  secretKey,
  secretKeyHeaderName,
  bundlePath,
  bundleName,
  allowedFiles,
  allowedFiletypes,
  ignoredFiles,
} = yargs.argv

const root = path.resolve(".")

const {
  options: {
    paths,
    allowed,
    allowedTypes,
    ignored,
  },
  methods: {
    readResponse,
    renderResponse,
  },
} = configure(
  root,
  bundlePath,
  bundleName,
  statsFileName,
  stateFileName,
  allowedFiles,
  allowedFiletypes,
  ignoredFiles,
  secretKey,
  secretKeyHeaderName,
)

function statsRequestHandler(request, response) {
  setNoCacheHeaders(response)
  const relFilePath = `${statsPath}/${statsFileName}`
  const absFilePath = path.resolve(`./${relFilePath}`)
  readResponse(
    absFilePath,
    request,
    response,
  )
}

function stateRequestHandler(request, response) {
  setNoCacheHeaders(response)

  const { reducerName } = request.params

  const stateFilePaths = [
    path.resolve(`./${statePath}/${reducerName}/${stateFileName}`),
    path.resolve(`./${pagesPath}/${reducerName}/reducer/${stateFileName}`),
  ]

  if (reducerName.endsWith("Modal")) {
    const str = reducerName.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    const bits = str.split(" ")
    const pageName = bits.shift()
    const last = bits.pop()
    const modalName = bits.map(s => s.toLowerCase()).join("-")

    stateFilePaths.push(
      path.resolve(
        `./${pagesPath}/${pageName}/modals/${modalName}/reducer/${stateFileName}`
      )
    )
  }

  getFirstExistingFile(stateFilePaths, existingPath => {
    if (existingPath) {
      return readResponse(
        existingPath,
        request,
        response,
      )
    }

    response.sendStatus(404)
  })
}

const http = require("http")

const concat = require("concat-stream")

function renderRequestHandler(request, response) {
  setNoCacheHeaders(response)
  renderResponse(
    paths,
    request,
    response,
  )
}

// Create the server
const app = express()

app.use(bodyParser.json({ limit: "1mb" }))

// Return the webpack stats for the agent/environment
app.get(`${statsUrl}`, statsRequestHandler)
app.get(`${statsUrl}/:encodedDate`, statsRequestHandler)

// Returns the json data for the default state of a reducer.
app.get(`${stateUrl}/:reducerName`, stateRequestHandler)
//app.get(`${stateUrl}/:reducerName/:encodedDate`, stateRequestHandler)
// Returns the intial HTML output of the react app.
app.post(renderUrl, renderRequestHandler)
//app.post(`${renderUrl}/:encodedDate`, renderRequestHandler)

app.listen(port, address, () => {
  logMessage([`Server listening at http(s)://${address}:${port}`])
  logMessage([`Allowed files: ${allowed.join(", ")}`])
  logMessage([`Allowed filetypes: ${allowedTypes.join(", ")}`])
  logMessage([`Ignored files: ${ignored.join(", ")}`])
})

