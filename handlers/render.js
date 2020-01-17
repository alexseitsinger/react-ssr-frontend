module.exports = ({
  url,
  responder,
  settings: {
    paths,
  },
}) => (request, response) => {
  responder(
    paths,
    request,
    response,
  )
}

