const fs = require("fs")
const path = require("path")

const { isArray } = require("underscore")
const utils = require("./utils")

module.exports = ({
  projectRoot,
  serverBundlePath,
  serverBundleName,
  browserStatsFileName,
  defaultStateFileName,
  allowedFiles,
  ignoredFiles,
  secretKeyValue,
  secretKeyHeaderName,
  reducerDirs,
  appPath,
}) => {
  const relativePath = path.join(serverBundlePath, serverBundleName)
  const absolutePath = path.resolve(`${projectRoot}/${relativePath}`)

  const allowedFilesComplete = [
    browserStatsFileName,
    defaultStateFileName,
    ...allowedFiles,
  ]

  const ignoredFilesComplete = [...utils.ignoredFilesDefault, ...ignoredFiles]

  function getFirstExistingFile(filePaths, callback) {
    let fileData
    let filePath

    filePaths.forEach(fp => {
      if (utils.isDefined(fileData) || isPermittedFile(fp) === false) {
        return
      }

      /**
       * To avoid the server crashing each time it tries to read a file that
       * doesnt exist, we need to wrap it in try/catch.
       */
      try {
        fileData = fs.readFileSync(fp, "utf-8")
        filePath = fp
      } catch (e) {}
    })

    const final = () => {
      if (utils.isDefined(fileData) && utils.isDefined(filePath)) {
        return callback(undefined, { fileData, filePath })
      }
      const err = new Error("File not found")
      callback(err, { fileData, filePath })
    }

    setTimeout(final, 1000)
  }

  const getDefaultStatePath = (prefix, suffix) => {
    let filePath = `${appPath}/${prefix}/${suffix}/${defaultStateFileName}`
    filePath = filePath.replace(/\/+/, "/")
    filePath = filePath.replace(/^\/+/, "")
    filePath = filePath.replace(/\/+$/, "")
    return filePath
  }

  const convertNameToPath = targetName => {
    return targetName.replace(/-/g, "/")
  }

  function getDefaultStateFilePathsPossible(targetName) {
    // if targetName = 'site-pages-home' ->
    //     targetPatn = 'site/pages/home'
    const targetPath = convertNameToPath(targetName)

    // 'site/pages/home/reducer'
    const targetReducerPath = `${targetPath}/reducer`

    let paths = [
      // site/pages/home/reducer/defaultState.json
      getDefaultStatePath("", targetReducerPath),
    ]

    if (utils.isDefined(reducerDirs) && isArray(reducerDirs)) {
      reducerDirs.forEach(reducerDir => {
        paths = [
          ...paths,
          // if reducerDirs = ['core/reducers', 'site/reducers']
          // if targetName = 'authentication' ->
          //     core/reducers/authentication/defaultState.json
          //     site/reducers/authentication/defaultState.json
          getDefaultStatePath(reducerDir, targetPath),
        ]
      })
    }

    return paths
  }

  // Prevent reading of certain files always.
  function isIgnoredFile(target) {
    const targetPath = path.resolve(target)
    const targetFile = path.basename(targetPath)
    return ignoredFilesComplete.includes(targetFile)
  }

  function isAllowedFile(target) {
    const targetPath = path.resolve(target)
    const targetName = path.basename(targetPath)
    let isAllowed = false
    allowedFilesComplete.forEach(fileName => {
      if (isAllowed) {
        return
      }
      if (targetName === fileName || targetName.startsWith(fileName)) {
        isAllowed = true
      }
    })
    return isAllowed
  }

  function isPermittedFile(target) {
    const ignoredFile = isIgnoredFile(target)
    const isAllowed = isAllowedFile(target)
    const outsideRoot = isOutsideRoot(target)
    const directory = utils.isDirectory(target)

    if (ignoredFile || outsideRoot || directory || !isAllowed) {
      let msgs = []
      const relative = path.relative(projectRoot, target)
      if (ignoredFile) {
        msgs = [...msgs, `${relative} is an ignored file`]
      }
      if (outsideRoot) {
        msgs = [...msgs, `${relative} is outside the project directory`]
      }
      if (directory) {
        msgs = [...msgs, `${relative} is a directory`]
      }
      if (!isAllowed) {
        msgs = [...msgs, `${relative} is not an allowed file`]
      }
      utils.logMessage(msgs)
      return false
    }

    return true
  }

  // Restrict all readFile attempts to files within this directory.
  function isOutsideRoot(target) {
    const relative = path.relative(projectRoot, path.resolve(target))
    return Boolean(relative.startsWith("..") && !path.isAbsolute(relative))
  }

  // Returns true if the header exists and it matches the key specified.
  function hasSecretKey(req) {
    const headerValue = req.get(secretKeyHeaderName)
    return utils.isNullish(secretKeyValue) || headerValue === secretKeyValue
  }

  function readResponse(filePath, request, response) {
    utils.setNoCacheHeaders(response)

    if (!hasSecretKey(request)) {
      response.sendStatus(404)
      return
    }

    getFirstExistingFile([filePath], (err, { fileData }) => {
      if (utils.isDefined(err)) {
        response.sendStatus(404)
        return
      }
      response.json(JSON.parse(fileData))
    })
  }

  function renderResponse(request, response) {
    utils.setNoCacheHeaders(response)

    if (!hasSecretKey(request)) {
      response.sendStatus(400)
      return
    }

    let isReturned = false

    const serverRenderer = utils.requireModule(absolutePath)
    const serverRender = serverRenderer()

    try {
      const rendered = serverRender(request, response)
      if (utils.isObject(rendered)) {
        response.json(rendered)
        isReturned = true
      } else {
        rendered.then(result => {
          response.json(result)
          isReturned = true
        })
      }
    } catch (e) {
      isReturned = true
      response.json({
        error: {
          type: e.constructor.name,
          message: e.message,
          stack: e.stack,
        },
      })
    }

    /**
     * iF, after 10 secods, we fail to return anything,
     * automatically send a 404 status and end the connection.
     */
    const final = () => {
      if (!isReturned) {
        response.sendStatus(404)
      }
    }

    setTimeout(final, 10000)
  }

  return {
    getFirstExistingFile,
    getDefaultStateFilePathsPossible,
    renderResponse,
    readResponse,
  }
}
