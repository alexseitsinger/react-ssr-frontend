const packageConfig = require("./.eslintrc-package.js")
const markdownConfig = require("./.eslintrc-markdown.js")
const typescriptConfig = require("./.eslintrc-typescript.js")
const javascriptConfig = require("./.eslintrc-javascript.js")

module.exports = {
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      ...javascriptConfig,
    },
    {
      files: ["*.ts", "*.tsx"],
      ...typescriptConfig,
    },
    {
      files: ["*.md"],
      ...markdownConfig,
    },
    {
      files: ["package.json"],
      ...packageConfig,
    },
  ],
}
