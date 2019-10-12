#!/usr/bin/env node

const { spawn } = require("child_process")
const fs = require("fs")

const envFile = ".env"

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

const startRenderServer = "yarn run start:render:development"
const startClientSideBundle = "yarn run start:client:development"
const startServerSideBundle = "yarn run start:server:development"

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
    case startClientSideBundle: {
      message("Client-side bundle compiling.")
      break
    }
    case startServerSideBundle: {
      message("Server-side bundle compiling.")
      break
    }
    case startRenderServer: {
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
  fs.exists(envFile, exists => {
    if (!exists) {
      return callback({})
    }
    fs.readFile(envFile, "utf-8", (err, data) => {
      if (err) {
        return
      }
      const lines = data.split("\n")
      const env = {}
      lines.forEach(line => {
        const pair = line.split("=")
        env[pair[0]] = pair[1]
      })
      callback(env)
    })
  })
}

const commands = [
  startRenderServer,
  startServerSideBundle,
  startClientSideBundle,
]

commands.forEach(command => {
  getEnv(env => spawnProcess({ command, env }))
})

