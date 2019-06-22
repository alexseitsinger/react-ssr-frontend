#!/usr/bin/env node

const { exec } = require("child_process")
const fs = require("fs")

const envFile = ".env"

function runCommand(command) {
  console.log(`Running: ${command}`)

  fs.exists(envFile, exists => {
    var fullCommand = command
    if(exists) {
      fullCommand = `env $(cat ${envFile} | xargs) ${fullCommand}`
    }

    // Invoke the command.
    exec(fullCommand, (err, stdout, stderr) => {
      if (err) {
        console.log(`${err.name}: ${err.message}\n\n${err.stack}`)
        return
      }

      console.log(`stdout: ${stdout}`)
      console.log(`stderr: ${stderr}`)
    })
  })
}

const commands = [
  "yarn run start:server:development",
  "yarn run watch:server:development",
  "yarn run watch:client:development",
]

commands.forEach(runCommand)
