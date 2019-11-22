const path = require("path")
const fs = require("fs")

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

function getFirstExistingFile(filePaths, callback) {
  var isFound = false

  filePaths.forEach((filePath, i) => {
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
    path.resolve(root, `./${bundlePathSuffix}`),
    path.resolve(root, `../../${bundlePathSuffix}`),
    path.resolve(root, `../../../../${bundlePathSuffix}`),
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
    ]
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
      callback(true, null)
    })
  }

  function readResponse(
    filePath,
    request,
    response,
  ) {
    if (!hasSecretKey(request)) {
      return response.sendStatus(400).end()
    }

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
        const renderBundle = requireModule(bundlePathFound)
        logMessage([`Successfully imported bundle. (${rel})`])

        renderBundle(request, context => {
          response.json(context)
          isRendered = true
          logMessage([`Successfully rendered bundle. (${rel})`])
        })
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
      renderResponse,
      readResponse,
    },
  }
}

module.exports = {
  configure,
  onFileExists,
  setNoCacheHeaders,
  getFirstExistingFile,
  isDirectory,
  requireModule,
  requireUncached,
  isFunction,
  logMessage,
}
