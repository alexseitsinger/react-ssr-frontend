const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  target: "node",
  devtool: false,
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        include: [
          path.resolve("./src"),
        ],
      },
    ],
  },
  externals: [
    nodeExternals({
      modulesFromFile: {
        include: ["dependencies", "devDependencies", "peerDependencies"],
        exclude: [],
      },
    }),
  ]
}
