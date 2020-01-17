const path = require("path")

module.exports = ({
  url,
  responder,
  settings: {
    statsPath,
    statsFileName,
  },
}) => (request, response) => {
  const relPath = `${statsPath}/${statsFileName}`

  responder(
    relPath,
    request,
    response,
  )
}

