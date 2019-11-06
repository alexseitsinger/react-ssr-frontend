#!/usr/bin/env node

const { spawn } = require("child_process")
const fs = require("fs")

const baseEnv = ".env"
const devEnv = ".env.development"

const skipped = [
  "Project is running at",
  "webpack output is served from",
  "Content not from webpack is served from",
  "404s will fallback to",
  "[nodemon]",
  "nodemon",
  "BABEL_ENV",
  "[react-ssr]",
  "wait until bundle finished",
]

const start = "yarn run start:development"
const startRender = `${start}:render`
const startClient = `${start}:client`
const startServer = `${start}:server`

const message = msg => {
  const dateObj = new Date()
  const dateStr = dateObj.toISOString()
  const [date, time] = dateStr.split("T")
  console.log(`[react-ssr]: ${msg} (${time})`)
}

function spawnProcess({ command, env = {} }) {
  const args = command.split(" ")
  const cmd = args.shift()

  switch (command) {
    default: {
      break
    }
    case startClient: {
      message("Client-side bundle compiling.")
      break
    }
    case startServer: {
      message("Server-side bundle compiling.")
      break
    }
    case startRender: {
      message("Render server starting.")
      break
    }
  }

  const proc = spawn(cmd, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...env,
    },
  })

  proc.stdout.on("data", data => {
    const msg = data.toString()

    const shouldPrint = skipped.map(text => {
      return (msg.indexOf(text) === -1)
    }).every(r => r === true)

    if (shouldPrint === true) {
      if (msg.indexOf("Compiled successfully") > -1) {
        message("Client-side bundle compiled.")
      }
      else if (msg.indexOf("Compiling") > -1) {
        message("Client-side bundle compiling.")
      }
    }
  })

  proc.stderr.on("data", data => {
    const msg = data.toString()
    if (msg.indexOf("webpack is watching the files") > -1) {
      message("Server-side bundle compiled.")
    }
    else {
      message(msg)
    }
  })
}

function getEnv(callback) {
  const files = [baseEnv, devEnv]
  const env = {}

  files.forEach(envFile => {
    fs.exists(envFile, exists => {
      if (!exists) {
        return callback({})
      }

      const data = fs.readFileSync(envFile, "utf8")
      const lines = data.split("\n")
      lines.forEach(line => {
        const [key, value] = line.split("=")
        env[key] = value
      })

      callback(env)
    })
  })
}

const commands = [
  startRender,
  startServer,
  startClient,
]

commands.forEach(command => {
  getEnv(env => spawnProcess({ command, env }))
})

