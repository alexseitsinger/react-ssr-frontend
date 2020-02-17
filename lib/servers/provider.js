const bodyParser = require("body-parser")
const express = require("express")

const { isDefined } = require("../utils")
const configure = require("../configure")

module.exports = ({
  address,
  port,
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
}) => {
  const {
    getFirstExistingFile,
    getDefaultStateFilePathsPossible,
    readResponse,
    renderResponse,
  } = configure({
    projectRoot,
    appPath,
    serverBundlePath,
    serverBundleName,
    browserStatsFileName,
    defaultStateFileName,
    reducerDirs,
    allowedFiles,
    ignoredFiles,
    secretKeyValue,
    secretKeyHeaderName,
  })

  const app = express()

  app.use(bodyParser.json())

  app.post(renderURL, (request, response) => renderResponse(request, response))

  app.get(`${defaultStateURL}/:reducerName`, (request, response) => {
    const { reducerName } = request.params
    const possiblePaths = getDefaultStateFilePathsPossible(reducerName)
    getFirstExistingFile(possiblePaths, (err, { filePath }) => {
      if (isDefined(err)) {
        response.sendStatus(404)
        return
      }
      readResponse(filePath, request, response)
    })
  })

  app.get(browserStatsURL, (request, response) =>
    readResponse(
      `${browserStatsPath}/${browserStatsFileName}`,
      request,
      response
    )
  )

  app.listen(port, address, () => {
    console.log(`Provider listening on http(s)://${address}:${port}`)
  })
}
