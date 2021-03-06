module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry",
        "corejs": 3,
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", {
      "corejs": 3,
    }],
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-syntax-export-default-from",
    "@babel/plugin-syntax-export-namespace-from",
  ],
}
