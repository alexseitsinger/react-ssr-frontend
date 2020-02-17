const path = require("path")
const nodeExternals = require("webpack-node-externals")
//const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
  entry: "./src/index.ts",
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
        test: /\.(j|t)sx?$/,
        include: [path.resolve("./src")],
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve("./tsconfig.dev.json"),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
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
