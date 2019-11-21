#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")

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
  .option("before", {
    describe: "The method to run before listening.",
    string: true,
  })
  .option("after", {
    describe: "The method to run after listening.",
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
  before,
  after,
  allowedFiles,
  allowedFiletypes,
  ignoredFiles,
} = yargs.argv

// The project root
const root = path.resolve(".")

// The paths used to find the bundle on the filesystem.
const bundlePathSuffix = path.join(bundlePath, bundleName)
const bundlePaths = [
  bundleName,
  path.resolve(__dirname, `./${bundlePathSuffix}`),
  path.resolve(__dirname, `../../${bundlePathSuffix}`),
  path.resolve(__dirname, `../../../../${bundlePathSuffix}`),
].filter(bp => {
  // Remove paths to bundles that exist outside the scope of the root.
  if (isOutsideRoot(bp)) {
    return false
  }
  return true
})

// The only files that are allowed to be read.
const allAllowedFiles = [statsFileName, stateFileName].concat(allowedFiles)

// The only filetypes that are allowed to be read.
const allAllowedFiletypes = [".json"].concat(allowedFiletypes)

// The only files that are never allowed to be read.
const allIgnoredFiles = [".env"].concat(ignoredFiles)

function logMessage(lines) {
  const first = `[react-ssr]: ${lines.shift()}`
  const rest = lines.map(line => `  ${line}`)
  const final = ([first].concat(rest)).join("\n")
  console.log(final)
}

function isFunction(f) {
  return Boolean(typeof f === "function")
}

function importDefault(pathToModule) {
  var b
  try {
    b = require(pathToModule).default
  }
  catch (e) {
    b = require(pathToModule)
  }
  return b
}

// Returns true if the header exists and it matches the key specified.
function hasSecretKey(req) {
  const header = req.get(secretKeyHeaderName)
  if (!secretKey || header === secretKey) {
    return true
  }
}

// Prevent reading of certain files always.
function isIgnoredFile(target) {
  const targetPath = path.resolve(target)
  const targetFile = path.basename(targetPath)
  return allIgnoredFiles.includes(targetFile)
}

function isAllowedFile(target) {
  const targetPath = path.resolve(target)
  const targetName = path.basename(targetPath)
  const targetExt = path.extname(targetName)
  var allowed = false
  if (allAllowedFiletypes.includes(targetExt)) {
    allAllowedFiles.forEach(allowedFile => {
      if (allowed === true) {
        return
      }
      if (targetName === allowedFile || targetName.startsWith(allowedFile)) {
        allowed = true
      }
    })
  }
  return allowed
}

function isPermittedFile(target) {
  const ignoredFile = isIgnoredFile(target)
  const outsideRoot = isOutsideRoot(target)
  const directory = isDirectory(target)
  const allowed = isAllowedFile(target)

  if (ignoredFile || outsideRoot || directory || !allowed) {
    const messages = []
    const relative = path.relative(root, target)
    if (ignoredFile) {
      messages.push(`${relative} is an ignored file.`)
    }
    if (outsideRoot) {
      messages.push(`${relative} is outside the root directory.`)
    }
    if (directory) {
      messages.push(`${relative} is a directory.`)
    }
    if (!allowed) {
      messages.push(`${relative} is not an allowed file.`)
    }
    logMessage(messages)
    return false
  }

  return true
}


// Check if the target is a directory.
function isDirectory(target) {
  try {
    return fs.lstatSync(target).isDirectory()
  }
  catch (e) {
    // throws an error if path doesnt exist
    return false
  }
}

// Restrict all readFile attempts to files within this directory.
function isOutsideRoot(target) {
  const relative = path.relative(root, path.resolve(target))
  return Boolean(relative && relative.startsWith("..") && !path.isAbsolute(relative))
}

function getFirstExistingFile(filePaths, callback) {
  var found = false

  filePaths.forEach((filePath, i) => {
    if (found === true) {
      return
    }
    onFileExists(filePath, existingPath => {
      if (found === true) {
        return
      }

      found = true
      callback(existingPath)
    })

    setTimeout(() => {
      if ((i + 1) === filePaths.length) {
        if (found === false) {
          callback()
        }
      }
    }, 1000)
  })
}

function onFileExists(target, callback, errback) {
  fs.exists(target, exists => {
    if (exists) {
      return callback(target)
    }

    //logMessage([`File doesn't exist: ${target}`])

    if (errback) {
      errback()
    }
  })
}

function readFile(target, callback) {
  const permitted = isPermittedFile(target)
  if (permitted === false) {
    return callback(true, null)
  }

  onFileExists(target, () => {
    fs.readFile(target, "utf8", (err, data) => {
      if (err) {
        return callback(true, null)
      }

      callback(null, data)
    })
  }, () => {
    //logMessage([`File doesn't exist at ${target}`])
    callback(true, null)
  })
}


function readResponse(file, req, res) {
  if (!hasSecretKey(req)) {
    return res.sendStatus(400).end()
  }

  readFile(file, (err, data) => {
    if (err) {
      return res.sendStatus(404).end()
    }

    res.json(JSON.parse(data))
  })
}

function renderResponse(req, res) {
  var isRendered = false

  if (!hasSecretKey(req)) {
    return res.sendStatus(400).end()
  }

  bundlePaths.forEach((bp, i, arr) => {
    if (isRendered === true) {
      return
    }

    onFileExists(bp, bundlePathFound => {
      if (isRendered === true) {
        return
      }

      const rel = path.relative(root, bundlePathFound)

      logMessage([`Successfully imported bundle. (${rel})`])

      const renderBundle = importDefault(bundlePathFound)

      renderBundle(req, context => {
        isRendered = true
        res.json(context)
        logMessage([`Successfully rendered bundle. (${rel})`])
      })
    })

    if (arr.length === (i + 1)) {
      setTimeout(() => {
        if (isRendered === false) {
          logMessage([`Failed to find a bundle at ${bundlePath}`])
          res.sendStatus(404).end()
        }
      }, 1000)
    }
  })
}

function listen(app) {
  var afterMethod

  app.listen(port, address, () => {
    logMessage([`Server listening at http(s)://${address}:${port}`])
    if (after) {
      afterMethod = importDefault(after)
    }

    if (isFunction(afterMethod)) {
      const relative = path.relative(root, after)

      logMessage([`Running 'after' method. (${relative})`])
      afterMethod(app, address, port)
    }
  })
}

function start(app) {
  var beforeMethod
  logMessage([`Allowed files: ${allAllowedFiles.join(", ")}`])
  logMessage([`Allowed filetypes: ${allAllowedFiletypes.join(", ")}`])
  logMessage([`Ignored files: ${allIgnoredFiles.join(", ")}`])

  if (before) {
    beforeMethod = importDefault(before)
  }
  if (isFunction(beforeMethod)) {
    const relative = path.relative(root, before)

    logMessage([`Running 'before' method. (${relative})`])
    beforeMethod(app, listen)
  }
  else {
    listen(app)
  }
}

// Create the server
const app = express()

app.use(bodyParser.json({ limit: "2mb" }))

// Return the webpack stats for the agent/environment
app.get(`${statsUrl}`, (req, res) => {
  const relFilePath = `${statsPath}/${statsFileName}`
  const absFilePath = path.resolve(`./${relFilePath}`)
  readResponse(absFilePath, req, res)
})


// Returns the json data for the default state of a reducer.
app.get(`${stateUrl}/:reducerName`, (req, res) => {
  const { reducerName } = req.params

  const stateFilePaths = [
    path.resolve(`./${statePath}/${reducerName}/${stateFileName}`),
    path.resolve(`./${pagesPath}/${reducerName}/reducer/${stateFileName}`),
  ]

  if (reducerName.endsWith("Modal")) {
    const str = reducerName.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
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
      return readResponse(existingPath, req, res)
    }

    res.sendStatus(404)
  })
})

// Returns the rendered react component data.
app.post(renderUrl, (req, res) => {
  renderResponse(req, res)
})

start(app)
