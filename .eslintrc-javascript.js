const path = require("path")

module.exports = {
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
  },
  settings: {
    "import/resolver": {
      jest: {
        jestConfigFile: "./jest.config.js",
      },
      webpack: {
        config: path.resolve("./webpack.config.dev.js"),
      },
    },
  },
  plugins: [
    "node",
    "import",
    "simple-import-sort",
    "jest",
    "jest-formatting",
    "react",
  ],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/simple-import-sort",
    "@alexseitsinger/eslint-config/jest",
    "@alexseitsinger/eslint-config/jest-formatting",
    "@alexseitsinger/eslint-config/react",
    "prettier",
    "prettier/babel",
    "prettier/react",
  ],
}
