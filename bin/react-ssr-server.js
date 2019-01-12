#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")

// Capture the options
yargs
	.option("address", {
		alias: "a",
		description: "Specify the servers address",
		default: "0.0.0.0"
	})
	.option("port", {
		alias: "p",
		description: "Specify the servers port",
		default: 3000
	})
	.option("renderUrl", {
		alias: "u",
		description: "The url to use for the render endpoint",
		default: "/render"
	})
	.option("defaultStateUrl", {
		alias: "d",
		description: "The url to use for getting default state.",
		default: "/state"
	})
	.option("defaultStatePath", {
		alias: "dsp",
		description: "The path to use for finding default state of reducers.",
		default: "src/reducers"
	})
	.option("defaultStateFileName", {
		alias: "dsfp",
		description: "The name of the state file for each reducer.",
		default: "state.json"
	})
	.option("secretKey", {
		alias: "k",
		description: "The secret key to use to allow a render."
	})
	.option("bundle", {
		alias: "b",
		description: "The bundle that contains our render function."
	})
	.help("h")
	.alias("h", "help")
	.strict()

// Create the variables
const {
	address,
	port,
	secretKey,
	renderUrl,
	defaultStateUrl,
	defaultStatePath,
	defaultStateFileName,
	bundle
} = yargs.argv

// Resolve the path to the bundle.
const bundlePath = path.resolve(`./${bundle}`)

// Import the server bundle
var render
try {
	render = require(bundlePath).default
} catch (e) {
	console.log("No render bundle found.")
}

// Run a function based on the secret key matching
function onSecretKeyMatch(secretKeyPassed, onSuccess, onFailure) {
	if (!secretKey || secretKeyPassed === secretKey) {
		return onSuccess()
	}
	return onFailure()
}

// Create the server
const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

// Returns the json data for the default state of a reducer.
app.get(`${defaultStateUrl}/:reducerName`, (req, res) => {
	const { reducerName } = req.params
	const stateFilePath = path.resolve(
		`./${defaultStatePath}/${reducerName}/${defaultStateFileName}`
	)
	fs.exists(stateFilePath, (exists) => {
		if (exists) {
			fs.readFile(stateFilePath, "utf8", (err, data) => {
				if (err) {
					throw err
				}
				res.json(JSON.parse(data))
			})
		} else {
			// do something if file doesnt exist.
			res.status(404).end()
		}
	})
})

// Returns the rendered react component data.
app.post(renderUrl, (req, res) => {
	if (render) {
		onSecretKeyMatch(
			req.body.secretKey,
			() => {
				const { url, initialState } = req.body
				render(req, url, initialState, (result) => {
					res.json(result)
				})
			},
			() => {
				res.status(400).end()
			}
		)
	} else {
		res.status(500).end()
	}
})

app.listen(port, address, () => {
	console.log(`Server listening at http(s)://${address}:${port}`)
})
