if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/main.js")
}
else {
  module.exports = require("./dist/main.dev.js")
}
