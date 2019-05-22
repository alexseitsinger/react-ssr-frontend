#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")

// Capture the options
yargs
	.option("address", {
		description: "Specify the servers address",
		default: "0.0.0.0"
	})
	.option("port", {
		description: "Specify the servers port",
		default: 3000
	})
	.option("renderUrl", {
		description: "The url to use for the render endpoint",
		default: "/render"
	})
	.option("stateUrl", {
		description: "The url to use for getting default state.",
		default: "/state"
	})
	.option("statePath", {
		description: "The path to use for finding default state file of reducer.",
		default: "src/reducers"
	})
	.option("stateFileName", {
		description: "The name of the state file for each reducer.",
		default: "state.json"
	})
	.option("statsUrl", {
		description: "The url to to use to get webpack stats data.",
		default: "/stats"
	})
	.option("statsPath", {
		description: "The path to the webpack stats file.",
		default: ""
	})
	.option("statsFileName", {
		description: "The name of the webpack stats file.",
		default: "webpack-stats"
	})
	.option("secretKey", {
		description: "The secret key to use to protect requests."
	})
	.option("secretKeyHeaderName", {
		description: "The HTTP header that is used for the secret key.",
		default: "secret-key"
	})
	.option("bundle", {
		description: "The bundle that contains our server-side app."
	})
	.help("h")
	.alias("h", "help")
	.strict()

// Create the variables
const {
	address,
	port,
	renderUrl,
	stateUrl,
	statePath,
	stateFileName,
	statsUrl,
	statsPath,
	statsFileName,
	secretKey,
	secretKeyHeaderName,
	bundle
} = yargs.argv

function getBundle() {
    // The variable to store our server-side render in.
    var serverRender
    // The paths possible to search from.
	const bundlePaths = [
		bundle,
		path.resolve(__dirname, `./${bundle}`),
		path.resolve(__dirname, `../../${bundle}`),
		path.resolve(__dirname, `../../../../${bundle}`),
    ]
    // Keep a list of each attempt that fails or succeeds.
	const failed = []
    const succeeded = []
    // While the bundle paths are remaining, run this function.
    while (bundlePaths.length){
        // Get the item from the top of the list.
        const bundlePath = bundlePaths.shift()
        // If the serverRender variable is empty, continue...
        if(!serverRender){
            // Create a result object to make our report from.
            const result = {"path": bundlePath}
            // Try to import the bundle using the patch provided.
            try {
                // If the import is successful, add it to the success list.
				serverRender = require(bundlePath).default
				succeeded.push(result)
			}
            catch (e) {
                // If the import fails, create an error message print after.
				result["error"] = {
					"type": e.name,
					"message": e.message,
                }
                // And add it to the list of failed bundle paths.
				failed.push(result)
			}
		}
    }
    // If the serverRender path is empty, print a message for each path tried.
	if(!serverRender){
		failed.forEach((obj) => {
			console.log(`Import failed: ${obj.path}`)
			console.log(`    Reason: ${obj.error.type} - ${obj.error.message}`)
		})
    }
    // Otherwise, print a message for the imports that succeeded.
	else {
		succeeded.forEach((obj) => {
			console.log(`Import succeeded: ${obj.path}`)
		})
    }
    // Return the serverRender object we found.
	return serverRender
}

function hasSecretKey(req) {
	const header = req.get(secretKeyHeaderName)
	if (!secretKey || header === secretKey) {
		return true
	}
}

function readFile(path, callback, errback) {
	fs.exists(path, (exists) => {
		if (exists) {
			fs.readFile(path, "utf8", (err, data) => {
				if (err) {
					throw err
				}
				callback(data)
			})
		} else {
			errback()
		}
	})
}

// Create the server
const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

app.get(`${statsUrl}/:agentName/:environmentName`, (req, res) => {
	if (!hasSecretKey(req)) {
		return res.status(400).end()
	}
	const { agentName, environmentName } = req.params
	const statsFile = path.resolve(
		`./${statsPath}/${statsFileName}.${agentName}.${environmentName}.json`
	)
	readFile(statsFile, (data) => {
		res.json(JSON.parse(data))
	}, () => {
		res.status(404).end()
	})
})

// Returns the json data for the default state of a reducer.
app.get(`${stateUrl}/:reducerName`, (req, res) => {
	if (!hasSecretKey(req)) {
		return res.status(400).end()
	}
	const { reducerName } = req.params
	const stateFile = path.resolve(
        `./${statePath}/${reducerName}/${stateFileName}`
	)
	readFile(stateFile, (data) => {
		res.json(JSON.parse(data))
	}, () => {
		res.status(404).end()
	})
})

// Returns the rendered react component data.
app.post(renderUrl, (req, res) => {
	const serverRender = getBundle()
	if (!serverRender) {
		return res.status(500).end()
	}
	if (!hasSecretKey(req)) {
		return res.status(400).end()
	}
	serverRender(req, (result) => {
		res.json(result)
	})
})

app.listen(port, address, () => {
	console.log(`Server listening at http(s)://${address}:${port}`)
})
