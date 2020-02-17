module.exports = {
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
  },
  plugins: ["package-json"],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/package-json",
  ],
}
