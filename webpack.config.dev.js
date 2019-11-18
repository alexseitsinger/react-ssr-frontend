const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  target: "node",
  devtool: "source-map",
  output: {
    path: path.resolve("./dist"),
    filename: "[name].dev.js",
    sourceMapFilename: "[name].dev.js.map",
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
  ],
}
