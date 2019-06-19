const path = require("path")

module.exports = {
  root: true,
  settings: {
    "import/resolver": {
      webpack: {
        config: path.resolve("./webpack.config.js")
      }
    }
  },
  extends: [
    "@alexseitsinger/eslint-config",
  ]
}