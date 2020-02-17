module.exports = {
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
  },
  plugins: ["node", "import", "react", "markdown"],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/react",
    "@alexseitsinger/eslint-config/markdown",
    "prettier",
    "prettier/react",
  ],
}
