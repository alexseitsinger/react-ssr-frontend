const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  target: "node",
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
        exclude: /node_modules/,
      },
    ],
  },
  externals: [
    /**
    nodeExternals({
      modulesFromFile: {
        exclude: ["dependencies"],
        include: ["peerDependencies", "devDependencies", "optionalDependencies"],
      },
    }),
    */
  ],
}
