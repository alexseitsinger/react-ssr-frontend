#!/usr/bin/env node

const yargs = require("yargs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")

// Capture the options
yargs
	.option("address", {
		describe: "Specify the servers address",
        default: "0.0.0.0",
        string: true,
	})
	.option("port", {
		describe: "Specify the servers port",
        default: 3000,
        number: true,
	})
	.option("renderUrl", {
		describe: "The url to use for the render endpoint",
        default: "/render",
        string: true,
	})
	.option("stateUrl", {
		describe: "The url to use for getting default state.",
        default: "/state",
        string: true,
	})
	.option("statePath", {
		describe: "The path to use for finding default state file of reducer.",
        default: "src/reducers",
        string: true
	})
	.option("stateFileName", {
		describe: "The name of the state file for each reducer.",
        default: "state.json",
        string: true,
    })
	.option("statsUrl", {
		describe: "The url to to use to get webpack stats data.",
        default: "/stats",
        string: true,
	})
	.option("statsPath", {
		describe: "The path to the webpack stats file.",
        default: "",
        string: true,
	})
	.option("statsFileName", {
		describe: "The name of the webpack stats file.",
        default: "webpack-stats",
        string: true,
	})
	.option("secretKey", {
        describe: "The secret key to use to protect requests.",
        string: true,
	})
	.option("secretKeyHeaderName", {
		describe: "The HTTP header that is used for the secret key.",
        default: "secret-key",
        string: true,
	})
    .option("bundlePath", {
        describe: "The path to find the bundle.",
        default: "bundles/server/development",
        string: true,
    })
	.option("bundleName", {
        describe: "The name of the bundle used for server-side rendering.",
        default: "server.js",
        string: true,
    })
    .option("before", {
        describe: "The method to run before listening.",
        string: true,
    })
    .option("after", {
        describe: "The method to run after listening.",
        string: true,
    })
    .option("allowedFiles", {
        describe: "Files that are allowed to be read.",
        default: [],
        array: true,
    })
    .option("allowedFiletypes", {
        describe: "Filetypes that are allowed to be read.",
        default: [],
        array: true,
    })
    .option("ignoredFiles", {
        describe: "Files that are never allowed to be read.",
        default: [],
        array: true,
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
    bundlePath,
    bundleName,
    before,
    after,
    allowedFiles,
    allowedFiletypes,
    ignoredFiles,
} = yargs.argv

// The project root
const root = path.resolve(".")

// The paths used to find the bundle on the filesystem.
const bundlePathSuffix = path.join(bundlePath, bundleName)
const bundlePaths = [
    bundleName,
    path.resolve(__dirname, `./${bundlePathSuffix}`),
    path.resolve(__dirname, `../../${bundlePathSuffix}`),
    path.resolve(__dirname, `../../../../${bundlePathSuffix}`),
].filter((bp) => {
    // Remove paths to bundles that exist outside the scope of the root.
    if(isOutsideRoot(bp)){
        return false
    }
    else {
        return true
    }
})

// The only files that are allowed to be read.
const allAllowedFiles = [statsFileName, stateFileName].concat(allowedFiles)

// The only filetypes that are allowed to be read.
const allAllowedFiletypes = [".json"].concat(allowedFiletypes)

// The only files that are never allowed to be read.
const allIgnoredFiles = [".env"].concat(ignoredFiles)

function logMessage(messages) {
    messages.forEach((msg) => console.log(`[react-ssr]: ${msg}`))
}

function isFunction(f) {
    return !!(typeof f === "function")
}

function importDefault(pathToModule) {
    try {
        return require(pathToModule).default
    }
    catch (e) {
        logMessage([
            `Failed to import default. (${pathToModule})`,
            `${e.name}: ${e.message}`,
        ])
    }
}

function getBundle(callback, errback) {
    var bundle
    // Keep a list of each attempt that fails or succeeds.
	const failed = []
    const succeeded = []
    var i = 0
    for(i; i<bundlePaths.length; i++){
        const bundlePath = bundlePaths[i]
        if(!bundle){
            const result = {"path": bundlePath}
            try {
                bundle = require(bundlePath).default
                succeeded.push(result)
            }
            catch (e) {
				result["error"] = {"name": e.name, "message": e.message}
				failed.push(result)
            }
        }
    }

    if(bundle){
        succeeded.forEach((obj) => {
            const relative = path.relative(root, obj.path)
            logMessage([`Successfully loaded bundle. (${relative})`])
        })
        callback(bundle)
    }
    else {
        failed.forEach((obj) => {
            const relative = path.relative(root, obj.path)
            logMessage([
                `Failed to load bundle. (${relative})`
                `${obj.error.name} - ${obj.error.message}`
            ])
        })
        errback()
    }
}

// Returns true if the header exists and it matches the key specified.
function hasSecretKey(req) {
	const header = req.get(secretKeyHeaderName)
	if (!secretKey || header === secretKey) {
		return true
    }
}

// Prevent reading of certain files always.
function isIgnoredFile(target){
    const targetPath = path.resolve(target)
    const targetFile = path.basename(targetPath)
    return allIgnoredFiles.includes(targetFile)
}

function isAllowedFile(target){
    const targetPath = path.resolve(target)
    const targetName = path.basename(targetPath)
    const targetExt = path.extname(targetName)
    var allowed = false
    if(allAllowedFiletypes.includes(targetExt)){
        allAllowedFiles.forEach((allowedFile) => {
            if(allowed === true) return
            if(targetName === allowedFile || targetName.startsWith(allowedFile)){
                allowed = true
            }
        })
    }
    return allowed
}

// Check if the target is a directory.
function isDirectory(target){
    try {
        return fs.lstatSync(target).isDirectory()
    }
    catch (e) {
        // throws an error if path doesnt exist
        return false
    }
}

// Restrict all readFile attempts to files within this directory.
function isOutsideRoot(target){
    const relative = path.relative(root, path.resolve(target))
    return !!(relative && relative.startsWith("..") && !path.isAbsolute(relative))
}

function readFile(target, callback, errback) {
    const ignoredFile = isIgnoredFile(target)
    const outsideRoot = isOutsideRoot(target)
    const directory = isDirectory(target)
    const allowed = isAllowedFile(target)
    if(ignoredFile || outsideRoot || directory || !allowed){
        const messages = ["Failed to read file."]
        const relative = path.relative(root, target)
        if(ignoredFile){
            messages.push(`${relative} is an ignored file.`)
        }
        if(outsideRoot){
            messages.push(`${relative} is outside the root directory.`)
        }
        if(directory){
            messages.push(`${relative} is a directory.`)
        }
        if(!allowed){
            messages.push(`${relative} is not an allowed file.`)
        }
        logMessage(messages)
        return errback()
    }
    
    fs.exists(target, (exists) => {
		if (exists) {
			return fs.readFile(target, "utf8", (err, data) => {
                if (err) {
                    logMessage([
                        `Failed to read file. (${file})`,
                        `${err.name}: ${err.message}`
                    ])
                    return errback()
                }
    
                callback(data)
			})
        } 
		
        errback()
	})
}

function readResponse(file, req, res){
	if (!hasSecretKey(req)) {
		return res.status(400).end()
    }
    const callback = (data) => res.json(JSON.parse(data))
    const errback = () => res.status(404).end()
    readFile(file, callback, errback) 
}

function renderResponse(req, res){
    if (!hasSecretKey(req)) {
        return res.status(400).end()
    }
    const callback = (render) => render(req, (context) => res.json(context))
    const errback = () => res.status(500).end()
    getBundle(callback, errback)
}

function listen() {
    app.listen(port, address, () => {
        logMessage([`Server listening at http(s)://${address}:${port}`])
        var afterMethod
        if(after){
            afterMethod = importDefault(after)
        }
        if(isFunction(afterMethod)){
            const relative = path.relative(root, after)
            logMessage([`Running 'after' method. (${relative})`])
            afterMethod(app, address, port)
        }
    }) 
}

function start() {
    logMessage([
        "Starting server",
        `Allowed files: ${allAllowedFiles.join(",")}`,
        `Allowed filetypes: ${allAllowedFiletypes.join(",")}`,
        `Ignored files: ${allIgnoredFiles.join(",")}`,
    ])
    var beforeMethod
    if(before){
        beforeMethod = importDefault(before)
    }
    if(isFunction(beforeMethod)){
        const relative = path.relative(root, before)
        logMessage([`Running 'before' method. (${relative})`])
        beforeMethod(app, listen)
    }
    else {
        listen()
    }
}

// Create the server
const app = express()

app.use(bodyParser.json({ limit: "10mb" }))

// Return the webpack stats for the agent/environment
app.get(`${statsUrl}/:agentName/:environmentName`, (req, res) => {
	const { agentName, environmentName } = req.params
	const file = path.resolve(`./${statsPath}/${statsFileName}.${agentName}.${environmentName}.json`)
    readResponse(file, req, res)
})

// Returns the json data for the default state of a reducer.
app.get(`${stateUrl}/:reducerName`, (req, res) => {
	const { reducerName } = req.params
	const file = path.resolve(`./${statePath}/${reducerName}/${stateFileName}`)
    readResponse(file, req, res)
})

// Returns the rendered react component data.
app.post(renderUrl, (req, res) => {
    renderResponse(req, res)
})

start()
