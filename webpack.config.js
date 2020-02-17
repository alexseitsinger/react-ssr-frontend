const path = require("path")
const nodeExternals = require("webpack-node-externals")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  target: "node",
  devtool: false,
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  plugins: [
    new CleanWebpackPlugin({
      dry: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        include: [path.resolve("./src")],
        use: ["babel-loader", "ts-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx"],
    alias: {
      tests: path.resolve("./tests"),
      src: path.resolve("./src"),
    },
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
