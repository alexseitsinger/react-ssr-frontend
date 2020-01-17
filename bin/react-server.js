#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")

const { configure } = require("../utils")

// Capture the options
yargs
  .option("address", {
    describe: "Specify the servers address",
    default: "0.0.0.0",
    string: true,
  })
  .option("renderUrl", {
    describe: "The url to use for the render endpoint",
    default: "/render",
    string: true,
  })
  .option("pagesPath", {
    describe: "The path the pages components.",
    default: "src/app/site/pages",
    string: true,
  })
  .option("stateUrl", {
    describe: "The url to use for getting default state.",
    default: "/state",
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
    default: "dist/development/browser",
    string: true,
  })
  .option("statsFileName", {
    describe: "The name of the webpack stats file.",
    default: "webpack.json",
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
    default: "dist/development/server",
    string: true,
  })
  .option("bundleName", {
    describe: "The name of the bundle used for server-side rendering.",
    default: "server.js",
    string: true,
  })
  .option("allowedFiles", {
    describe: "Files that are allowed to be read.",
    default: ["webpack.json"],
    array: true,
  })
  .option("allowedFiletypes", {
    describe: "Filetypes that are allowed to be read.",
    default: [".json"],
    array: true,
  })
  .option("ignoredFiles", {
    describe: "Files that are never allowed to be read.",
    default: [],
    array: true,
  })
  .option("webpackConfig", {
    describe: "The webpack config to use for the compilers",
    default: "webpack.config.js",
    string: true,
  })
  .help("h")
  .alias("h", "help")
  .strict()

// Create the variables
const {
  address,
  renderUrl,
  stateUrl,
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
  webpackConfig,
} = yargs.argv


const root = path.resolve(".")

const {
  options: {
    paths,
  },
  methods: {
    getFirstExistingFile,
    getStateFilePaths,
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

if (process.env.NODE_ENV !== "production") {
  const startCompilerServer = require("../servers/compiler")

  startCompilerServer({
    address,
    renderResponse,
    config: path.join(root, webpackConfig),
  })
}

const startProviderServer = require("../servers/provider")

startProviderServer({
  address,
  render: {
    url: renderUrl,
    responder: renderResponse,
    settings: {
      paths,
    },
  },
  state: {
    url: stateUrl,
    responder: readResponse,
    settings: {
      getFirstExistingFile,
      getStateFilePaths,
      pagesPath,
    },
  },
  stats: {
    url: statsUrl,
    responder: readResponse,
    settings: {
      statsPath,
      statsFileName,
    },
  },
})

