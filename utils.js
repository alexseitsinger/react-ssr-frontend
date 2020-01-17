const fs = require("fs")

const path = require("path")

function logMessage(lines) {
  const first = `[react-ssr]: ${lines.shift()}`
  const rest = lines.map(line => `  ${line}`)
  const final = ([first].concat(rest)).join("\n")
  console.log(final)
}

function isFunction(f) {
  return Boolean(typeof f === "function")
}

function requireUncached(mod) {
  delete require.cache[require.resolve(mod)]
  return require(mod)
}

function requireModule(modulePath) {
  try {
    return requireUncached(modulePath).default
  }
  catch (e) {
    return requireUncached(modulePath)
  }
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

function setNoCacheHeaders(res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate")
  res.header("Expires", "-1")
  res.header("Pragma", "no-cache")
}

function onFileExists(target, callback, errback) {
  fs.exists(target, exists => {
    if (exists) {
      return callback(target)
    }

    if (errback) {
      errback()
    }
  })
}

function configure(
  root,
  bundlePath,
  bundleName,
  statsFileName,
  stateFileName,
  allowedFiles,
  allowedFileTypes,
  ignoredFiles,
  secretKey,
  secretKeyHeaderName,
) {
  // The paths used to find the bundle on the filesystem.
  const bundlePathSuffix = path.join(bundlePath, bundleName)
  const bundlePaths = [
    bundleName,
    path.resolve(`./${bundlePathSuffix}`),
    path.resolve(`../../${bundlePathSuffix}`),
    path.resolve(`../../../../${bundlePathSuffix}`),
  ].filter(bp => {
    if (isOutsideRoot(bp, root)) {
      return false
    }
    return true
  })

  const opts = {
    paths: bundlePaths,
    allowed: [
      statsFileName,
      stateFileName,
      ...allowedFiles,
    ],
    allowedTypes: [
      ".json",
      ...allowedFileTypes,
    ],
    ignored: [
      ".env",
      ".env.local",
      ".env.development",
      ".env.stage",
      ".env.stage.local",
      ".env.production",
      ".env.production.local",
      ...ignoredFiles,
    ],
  }

  function getFirstExistingFile(filePaths, callback) {
    var isFound = false

    const realPaths = filePaths.map(p => path.join(root, p))

    realPaths.forEach((filePath, i) => {
      if (isFound === true) {
        return
      }
      onFileExists(filePath, existingPath => {
        if (isFound === true) {
          return
        }

        isFound = true
        callback(existingPath)
      })
      setTimeout(() => {
        if ((i + 1) === filePaths.length) {
          if (isFound === false) {
            callback()
          }
        }
      }, 1000)
    })
  }


  function getStateFilePaths({
    reducerName,
    pagesPath,
  }) {
    const reducerFile = `reducer/${stateFileName}`

    const paths = [
      `src/app/core/reducers/${reducerName}/${stateFileName}`,
      `src/app/site/reducers/${reducerName}/${stateFileName}`,
      `${pagesPath}/${reducerName}/${reducerFile}`,
    ]

    if (reducerName.endsWith("Modal")) {
      const { modalName, pageName } = getNamesForState(reducerName)
      const modalPath = `${pagesPath}/${pageName}/modals/${modalName}/${reducerFile}`
      paths.push(modalPath)
    }

    return paths
  }


  // Prevent reading of certain files always.
  function isIgnoredFile(target) {
    const targetPath = path.resolve(target)
    const targetFile = path.basename(targetPath)
    return opts.ignored.includes(targetFile)
  }

  function isAllowedFile(target) {
    const targetPath = path.resolve(target)
    const targetName = path.basename(targetPath)
    const targetExt = path.extname(targetName)

    var isAllowed = false
    if (opts.allowedTypes.includes(targetExt)) {
      opts.allowed.forEach(fileName => {
        if (isAllowed === true) {
          return
        }
        if (targetName === fileName || targetName.startsWith(fileName)) {
          isAllowed = true
        }
      })
    }
    return isAllowed
  }

  function isPermittedFile(target) {
    const ignoredFile = isIgnoredFile(target)
    const outsideRoot = isOutsideRoot(target)
    const directory = isDirectory(target)
    const isAllowed = isAllowedFile(target)

    if (ignoredFile || outsideRoot || directory || !isAllowed) {
      const messages = []
      const relative = path.relative(root, target)
      if (ignoredFile) {
        messages.push(`${relative} is an ignored file.`)
      }
      if (outsideRoot) {
        messages.push(`${relative} is outside the __dirname directory.`)
      }
      if (directory) {
        messages.push(`${relative} is a directory.`)
      }
      if (!isAllowed) {
        messages.push(`${relative} is not an allowed file.`)
      }
      logMessage(messages)
      return false
    }

    return true
  }

  // Restrict all readFile attempts to files within this directory.
  function isOutsideRoot(target) {
    const relative = path.relative(root, path.resolve(target))
    return Boolean(relative && relative.startsWith("..") && !path.isAbsolute(relative))
  }

  // Returns true if the header exists and it matches the key specified.
  function hasSecretKey(req) {
    const headerValue = req.get(secretKeyHeaderName)
    if (!secretKey || (headerValue === secretKey)) {
      return true
    }
    return false
  }

  function readFile(target, callback) {
    const isPermitted = isPermittedFile(target)
    if (isPermitted === false) {
      console.log("file not permitted")
      return callback(true, null)
    }
    onFileExists(target, () => {
      fs.readFile(target, "utf8", (err, data) => {
        if (err) {
          console.log("fs.readFile error")
          return callback(true, null)
        }

        callback(null, data)
      })
    }, () => {
      console.log("file doesnt exist")
      callback(true, null)
    })
  }

  function readResponse(
    filePath,
    request,
    response,
  ) {
    setNoCacheHeaders(response)

    if (!hasSecretKey(request)) {
      return response.sendStatus(400).end()
    }

    //const realPath = path.join(root, filePath)
    readFile(filePath, (err, data) => {
      if (err) {
        return response.sendStatus(404).end()
      }

      response.json(JSON.parse(data))
    })
  }

  function renderResponse(
    bundlesSuspected,
    request,
    response,
  ) {
    setNoCacheHeaders(response)

    if (!hasSecretKey(request)) {
      return response.sendStatus(400).end()
    }

    var isRendered = false
    bundlesSuspected.forEach((bp, i, arr) => {
      if (isRendered === true) {
        return
      }
      onFileExists(bp, bundlePathFound => {
        if (isRendered === true) {
          return
        }

        const rel = path.relative(root, bundlePathFound)
        const serverRenderer = requireModule(bundlePathFound)
        const serverRender = serverRenderer()
        logMessage([`Successfully imported bundle. (${rel})`])

        try {
          const rendered = serverRender(request, response)
          if (Object.prototype.toString.call(rendered) === "[object Object]") {
            response.json(rendered)
            isRendered = true
          }
          else {
            rendered.then(result => {
              response.json(result)
              isRendered = true
            })
          }
        }
        catch (e) {
          response.json({
            error: {
              type: e.constructor.name,
              message: e.message,
              stack: e.stack,
            },
          })
        }
      })

      if (arr.length === (i + 1)) {
        setTimeout(() => {
          if (isRendered === false) {
            response.sendStatus(404).end()
          }
        }, 1000)
      }
    })
  }

  return {
    options: opts,
    methods: {
      getFirstExistingFile,
      getStateFilePaths,
      renderResponse,
      readResponse,
    },
  }
}

function getNamesForState(reducerName) {
  const str = reducerName.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  const bits = str.split(" ")
  const pageName = bits.shift()
  const modalName = bits.map(s => s.toLowerCase()).join("-")
  return {
    pageName,
    modalName,
  }
}

module.exports = {
  configure,
  onFileExists,
  setNoCacheHeaders,
  isDirectory,
  requireModule,
  requireUncached,
  isFunction,
  logMessage,
}
