#!/usr/bin/env node
let getStream = require("get-stream")
let yargs = require("yargs")
let execa = require("execa")
let path = require("path")
let fs = require("fs-extra")

let {
	argv
} = yargs.options({
	deploymentDirectory: {
		alias: ["d", "directory"],
		default: "/application",
		type: "string"
	},
	deploymentBranch: {
		alias: ["b", "branch", "brank"],
		default: "master",
		type: "string"
	},
	repoDirectory: {
		alias: ["r", "repo"],
		// the post-receive runs in the repo
		default: process.cwd(),
		type: "string"
	}
})

void async function postｰreceive () {
	let input = await getStream(process.stdin)

	// post-receive gets called with `${previousRevisionHash} ${newRevisionHash} ${ref}`
	let [, , ref] = input.split(/\s+/)
	// ref takes the form `/refs/heads/${name}`
	let [, brank] = ref.match(/refs\/heads\/(.*)/)


	if (brank != argv.brank) {
		return console.log(`not going to make ${brank} live. only ${argv.brank} is made live.`)
	}

	console.log(`received new snoot content on ${brank} ! going to deploy, install, build at ${argv.deploymentDirectory}`)

	// cool, we have new code in the live branch !!
	if (!await fs.pathExists(argv.deploymentDirectory)) {
		console.warn(`warn: deploy directory "${argv.deploymentDirectory}" didn't exist. making it`)
		await fs.mkdirp(argv.deploymentDirectory)
	}

	await execa("git", [
		`--work-tree=${argv.deploymentDirectory}`,
		`--git-dir=${argv.repo}`,
		"checkout",
		"-f",
		brank
	])

	let packageJsonPath = path.resolve(argv.deploymentDirectory, "package.json")

	let hasPackageJson = await fs.pathExists(packageJsonPath)

	if (!hasPackageJson) {
		return console.warn("no package.json so considering this snoot deployed")
	}

	await execa("npm", [
		"install",
		`--prefix=${argv.deploymentDirectory}`
	])

	let package = require(packageJsonPath)

	if (!package.scripts || !package.scripts.build) {
		return console.warn("no package.json#scripts#build so considering this snoot deployed!!")
	}

	await execa("npm", [
		"run-script",
		`--prefix=${argv.deploymentDirectory}`,
		"build"
	])

	console.log("snoot deployed, installed && built !!")
}()

