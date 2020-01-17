module.exports = ({
  url,
  responder,
  settings: {
    getFirstExistingFile,
    getStateFilePaths,
    pagesPath,
  },
}) => (request, response) => {
  const { reducerName } = request.params

  const possiblePaths = getStateFilePaths({
    reducerName,
    pagesPath,
  })

  getFirstExistingFile(possiblePaths, pathFound => {
    if (pathFound) {
      return responder(
        pathFound,
        request,
        response,
      )
    }

    response.sendStatus(404)
  })
}

