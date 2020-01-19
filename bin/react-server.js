#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")


// Capture the options
yargs
  .option("address", {
    describe: "Specify the address to use for the compiler and provider servers.",
    default: "0.0.0.0",
    string: true,
  })
  .option("compilerPort", {
    describe: "The port to use for the compiler server.",
    default: 8081,
    number: true,
  })
  .option("providerPort", {
    describe: "The port to use for the provider server.",
    default: 8082,
    number: true,
  })
  .option("webpackConfig", {
    describe: "The (double) webpack config to use for the compilers.",
    default: "webpack.config.js",
    string: true,
  })


  .option("renderUrl", {
    describe: "The url for server-side rendering.",
    default: "/render",
    string: true,
  })


  .option("reducersDirs", {
    describe: "The paths to find a reducers default state",
    array: true,
  })
  .option("pagesDir", {
    describe: "The path to find a pages reducer default state",
    string: true,
  })
  .option("defaultStateUrl", {
    describe: "The url for retrieving a reducers default state.",
    default: "/defaultState",
    string: true,
  })
  .option("defaultStateFileName", {
    describe: "The filename that contains the reducers default state.",
    default: "defaultState.json",
    string: true,
  })


  .option("browserStatsUrl", {
    describe: "The url to retrieve the browser stats.",
    default: "/browserStats",
    string: true,
  })
  .option("browserStatsPath", {
    describe: "The path to the browser stats file.",
    default: "dist/development/browser",
    string: true,
  })
  .option("browserStatsFileName", {
    describe: "The name of the browser stats file.",
    default: "webpack.json",
    string: true,
  })


  .option("secretKeyValue", {
    describe: "The value that the secret key should be.",
    string: true,
  })
  .option("secretKeyHeaderName", {
    describe: "The HTTP header that is used for the secret key.",
    default: "secret-key",
    string: true,
  })


  .option("serverBundlePath", {
    describe: "The path to find the server bundle.",
    default: "dist/development/server",
    string: true,
  })
  .option("serverBundleName", {
    describe: "The name of the server bundle.",
    default: "server.js",
    string: true,
  })


  .option("allowedFiles", {
    describe: "Files that are always allowed to be read.",
    default: ["webpack.json"],
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

const {
  address,
  compilerPort,
  providerPort,
  webpackConfig,
  renderUrl,
  defaultStateFileName,
  defaultStateUrl,
  reducersDirs,
  pagesDir,
  browserStatsUrl,
  browserStatsPath,
  browserStatsFileName,
  secretKeyValue,
  secretKeyHeaderName,
  serverBundlePath,
  serverBundleName,
  allowedFiles,
  ignoredFiles,
} = yargs.argv


// This should be the path of the project.
const projectRoot = path.resolve(".")
const webpackConfigPath = path.join(projectRoot, webpackConfig)
const startCompilerServer = require("../servers/compiler")
const startProviderServer = require("../servers/provider")

if (process.env.NODE_ENV !== "production") {
  startCompilerServer({
    address,
    port: compilerPort,
    webpackConfigPath,
  })
}

startProviderServer({
  address,
  port: providerPort,
  renderUrl,
  defaultStateUrl,
  browserStatsPath,
  browserStatsUrl,
  projectRoot,
  serverBundlePath,
  serverBundleName,
  browserStatsFileName,
  defaultStateFileName,
  reducersDirs,
  pagesDir,
  allowedFiles,
  ignoredFiles,
  secretKeyValue,
  secretKeyHeaderName,
})

