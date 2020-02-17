#!/usr/bin/env node

const path = require("path")
const yargs = require("yargs")
const startCompilerServer = require("../lib/servers/compiler")
const startProviderServer = require("../lib/servers/provider")

// Capture the options
const { argv } = yargs.options({
  address: {
    type: "string",
    default: "0.0.0.0",
    describe: "The address to listen on for the compiler and providers.",
  },
  compilerPort: {
    describe: "The port to use for the compiler server",
    type: "number",
    default: 8081,
  },
  providerPort: {
    describe: "The port to use for the provider server.",
    type: "number",
    default: 8082,
  },
  browserConfig: {
    describe: "The webpack config to use for the browser bundle.",
    type: "string",
    default: "webpack.config.js",
  },
  serverConfig: {
    describe: "The webpack config to use for the server bundle.",
    type: "string",
    default: "webpack.config.js",
  },
  renderURL: {
    describe: "The URL to send server-side render requests to.",
    default: "/render",
    type: "string",
  },
  reducerDirs: {
    describe: "The paths where reducers can be found.",
    type: "array",
  },
  appPath: {
    describe: "The base path to apply to files within the project",
    type: "string",
    demandOption: true,
  },
  defaultStateURL: {
    describe: "The URL for retrieving a reducer's default state.",
    default: "/defaultState",
    type: "string",
  },
  defaultStateFileName: {
    describe: "The filename to read which contains the reducers default state.",
    default: "defaultState.json",
    type: "string",
  },
  browserStatsURL: {
    describe: "The URL for retrieving the browser bundle's webpack stats",
    default: "/browserStats",
    type: "string",
  },
  browserStatsPath: {
    describe: "The path where the browser bundle's webpack stats can be found.",
    type: "string",
    demandOption: true,
  },
  browserStatsFileName: {
    describe: "The name of the browser bundle's webpack stats file.",
    default: "stats.json",
    type: "string",
  },
  secretKeyValue: {
    describe: "The value that the secret key should match.",
    type: "string",
  },
  secretKeyHeaderName: {
    describe:
      "The HTTP header that is used to pass the secret key to the sever.",
    default: "secret-key",
    type: "string",
  },
  serverBundlePath: {
    describe: "The path to the server bundle.",
    type: "string",
    demandOption: true,
  },
  serverBundleName: {
    describe: "The name of the server bundle.",
    default: "server.js",
    type: "string",
  },
  allowedFiles: {
    describe: "Files that are always allowed to be read.",
    default: ["webpack.json"],
    type: "array",
  },
  ignoredFiles: {
    describe: "Files that are never allowed to be read.",
    default: [],
    type: "array",
  },
})

const {
  address,
  compilerPort,
  providerPort,
  browserConfig,
  serverConfig,
  renderURL,
  defaultStateFileName,
  defaultStateURL,
  reducerDirs,
  browserStatsURL,
  browserStatsPath,
  browserStatsFileName,
  secretKeyValue,
  secretKeyHeaderName,
  serverBundlePath,
  serverBundleName,
  allowedFiles,
  ignoredFiles,
  appPath,
} = argv

// This should be the path of the project.
const projectRoot = path.resolve(".")
const browser = path.join(projectRoot, browserConfig)
const server = path.join(projectRoot, serverConfig)

if (process.env.NODE_ENV !== "production") {
  startCompilerServer({
    address,
    port: compilerPort,
    configs: {
      browser,
      server,
    },
  })
}

startProviderServer({
  address,
  port: providerPort,
  renderURL,
  defaultStateURL,
  browserStatsPath,
  browserStatsURL,
  projectRoot,
  serverBundlePath,
  serverBundleName,
  browserStatsFileName,
  defaultStateFileName,
  reducerDirs,
  allowedFiles,
  ignoredFiles,
  secretKeyValue,
  secretKeyHeaderName,
  appPath,
})
