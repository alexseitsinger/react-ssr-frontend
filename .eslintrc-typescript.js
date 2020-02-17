const path = require("path")

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
      jest: {
        jestConfigFile: path.resolve("./jest.config.js"),
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
    "@typescript-eslint/eslint-plugin",
    "react",
  ],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/simple-import-sort",
    "@alexseitsinger/eslint-config/jest",
    "@alexseitsinger/eslint-config/jest-formatting",
    "@alexseitsinger/eslint-config/typescript-eslint",
    "@alexseitsinger/eslint-config/react",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint",
  ],
}
