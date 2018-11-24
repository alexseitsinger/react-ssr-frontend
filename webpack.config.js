const path = require("path")

module.exports = {
    entry: "./src/index.js",
    mode: "production",
    output: {
        path: path.resolve("./dist"),
        filename: "[name].js",
        libraryTarget: "commonjs2",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: "babel-loader",
            }
        ]
    },
}