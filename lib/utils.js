const fs = require("fs")

function isNullish(o) {
  return typeof o === "undefined" || o === null
}

function isDefined(o) {
  return isNullish(o) === false
}

function logMessage(lines) {
  const first = `[react-ssr]: ${lines.shift()}`
  const rest = lines.map(line => `  ${line}`)
  const final = [first].concat(rest).join("\n")
  console.log(final)
}

function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]"
}

function requireUncached(mod) {
  delete require.cache[require.resolve(mod)]
  return require(mod)
}

function requireModule(modulePath) {
  try {
    return requireUncached(modulePath).default
  } catch (e) {
    return requireUncached(modulePath)
  }
}

// Check if the target is a directory.
function isDirectory(o) {
  try {
    return fs.lstatSync(o).isDirectory()
  } catch (e) {
    // throws an error if path doesnt exist
    return false
  }
}

function setNoCacheHeaders(res) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate")
  res.header("Expires", "-1")
  res.header("Pragma", "no-cache")
}

function getNamesForModalDefaultState(reducerName) {
  const str = reducerName.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  const bits = str.split(" ")
  const first = bits.shift()
  let pageName = ""
  if (first !== undefined) {
    pageName = first
  }
  const modalName = bits.map(s => s.toLowerCase()).join("-")
  return {
    pageName,
    modalName,
  }
}

const ignoredFilesDefault = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.stage",
  ".env.stage.local",
  ".env.production",
  ".env.production.local",
]

module.exports = {
  ignoredFilesDefault,
  getNamesForModalDefaultState,
  setNoCacheHeaders,
  isDirectory,
  requireModule,
  requireUncached,
  isObject,
  logMessage,
  isDefined,
  isNullish,
}
