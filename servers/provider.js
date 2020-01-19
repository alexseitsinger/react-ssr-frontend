const express = require("express")
const bodyParser = require("body-parser")
const { configure } = require("../utils")

module.exports = ({
  address,
  port,
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
}) => {
  const {
    getFirstExistingFile,
    getDefaultStateFilePathsPossible,
    readResponse,
    renderResponse,
  } = configure({
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

  const app = express()

  app.use(bodyParser.json())

  app.post(renderUrl, (request, response) => renderResponse(request, response))

  app.get(`${defaultStateUrl}/:reducerName`, (request, response) => {
    const { reducerName } = request.params
    const possiblePaths = getDefaultStateFilePathsPossible(reducerName)
    getFirstExistingFile(possiblePaths, pathFound => {
      if (pathFound) {
        return readResponse(
          pathFound,
          request,
          response,
        )
      }
      response.sendStatus(404)
    })
  })

  app.get(browserStatsUrl, (request, response) => readResponse(
    `${browserStatsPath}/${browserStatsFileName}`,
    request,
    response,
  ))

  app.listen(port, address, () => {
    console.log(`Provider listening on http(s)://${address}:${port}`)
  })
}

