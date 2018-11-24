#!/usr/bin/env node

var argv = require("yargs")
	.option("address", {
		description: "Specify the servers address",
		default: "0.0.0.0"
	})
	.option("port", {
		description: "Specify the servers port",
		default: 3000
	})
	.option("bundle", {
		description: "The bundle that contains our render function."
	})
	.option("secretKey", {
		description: "The secret key to use to allow a render.",
		default: "THIS_IS_A_SECRET_KEY"
	})
	.option("url", {
		description: "The url to use for the render endpoint",
		default: "/render"
	})
	.help("h")
	.alias("h", "help")
	.strict().argv

const ADDRESS = argv.address
const PORT = argv.port
const BUNDLE = argv.bundle
const SECRET_KEY = argv.secretKey
const URL = argv.url

const express = require("express")
const bodyParser = require("body-parser")

const render = require(BUNDLE).default

const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

app.post(URL, (req, res) => {
	const secretKey = req.body.secretKey
	if (secretKey && secretKey === SECRET_KEY) {
		const url = req.body.url
		const initialState = req.body.initialState
		render(req, url, initialState, (result) => {
			res.json(result)
		})
	} else {
		res.status(404).end()
	}
})

app.listen(PORT, ADDRESS, () => {
	console.log(`Render server listening on http://${ADDRESS}:${PORT}`)
})
