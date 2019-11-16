const path = require("path")

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  settings: {
    "import/resolver": {
      webpack: {
        config: path.resolve("./webpack.config.dev.js")
      }
    }
  },
  extends: [
    "@alexseitsinger/eslint-config-base",
    "@alexseitsinger/eslint-config-react",
  ]
}
