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
		description: "The bundle that contains our server bundle."
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

console.log(`Using bundle: ${bundle}`)

// Resolve the path to the bundle.
const bundlePathFlat = bundle
const bundlePathCurrent = path.resolve(__dirname, `./${bundle}`)
const bundlePathRelative = path.resolve(__dirname, `../../${bundle}`)
const bundlePathFullRelative = path.resolve(__dirname, `../../../../${bundle}`)

// Import the server bundle
var render
try {
	console.log(`Trying bundle path: ${bundlePathFlat}`)
	render = require(bundlePathFlat).default
} catch (e) {
	try {
		console.log(`Trying bundle path: ${bundlePathCurrent}`)
		render = require(bundlePathCurrent).default
	}
	catch (e) {
		try {
			console.log(`Trying bundle path: ${bundlePathRelative}`)
			render = require(bundlePathRelative).default
		}
		catch (e) {
			try {
				console.log(`Trying bundle path: ${bundlePathFullRelative}`)
				render = require(bundlePathFullRelative).default
			}
			catch (e) {
				console.log("No server bundle found.")
			}
		}
	}
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
	readFile(
		statsFile,
		(data) => {
			res.json(JSON.parse(data))
		},
		() => {
			res.status(404).end()
		}
	)
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
	readFile(
		stateFile,
		(data) => {
			res.json(JSON.parse(data))
		},
		() => {
			res.status(404).end()
		}
	)
})

// Returns the rendered react component data.
app.post(renderUrl, (req, res) => {
	if (!render) {
		return res.status(500).end()
	}
	if (!hasSecretKey(req)) {
		return res.status(400).end()
	}
	const { url, initialState } = req.body
	render(req, url, initialState, (result) => {
		res.json(result)
	})
})

app.listen(port, address, () => {
	console.log(`Server listening at http(s)://${address}:${port}`)
})
