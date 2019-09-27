#!/usr/bin/env node

const { spawn } = require("child_process")
const fs = require("fs")

const envFile = ".env"

function spawnServer({ command, env = {} }) {
  const args = command.split(" ")
  const cmd = args.shift()

  spawn(cmd, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
    },
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

function runCommand(command) {
  console.log(`Running: ${command}`)

  getEnv(env => spawnServer({ command, env }))
}

const commands = [
  "yarn run start:render:development",
  "yarn run start:client:development",
  "yarn run start:server:development",
]

commands.forEach(runCommand)

process.on("disconnect", () => {
  process.exit()
})
