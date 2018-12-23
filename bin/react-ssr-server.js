#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")

// Capture the options
yargs
	.option("address", {
		alias: "a",
		description: "Specify the servers address",
		default: "127.0.0.1"
	})
	.option("port", {
		alias: "p",
		description: "Specify the servers port",
		default: 3000
	})
	.option("url", {
		alias: "u",
		description: "The url to use for the render endpoint",
		default: "/render"
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
const { address, port, secretKey, url, bundle } = yargs.argv
const bundlePath = path.resolve(`./${bundle}`)

// Import the server bundle
var render
try {
	render = require(bundlePath).default
} catch (e) {
	render = null
}

// Create the server
const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

app.post(url, (req, res) => {
	if (!secretKey || req.body.secretKey === secretKey) {
		if (render) {
			render(req, req.body.url, req.body.initialState, (result) => {
				res.json(result)
			})
		} else {
			res.status(500).end()
		}
	} else {
		res.status(404).end()
	}
})

app.listen(port, address, () => {
	console.log(`Render server listening on http://${address}:${port}`)
})
