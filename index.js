if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/main")
} else {
  module.exports = require("./dist/main.dev")
}
