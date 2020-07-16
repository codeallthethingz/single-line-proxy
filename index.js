#!/usr/bin/env node
const http = require('http')
const simpleProxy = require('./proxy')
const chalk = require('chalk')
const { exception } = require('console')
let port = 8000
let args = process.argv.slice(2)

let target = {}
for (arg of args) {
    let newPort = -1
    try {
        newPort = parseInt(arg)
    } catch (exception) {
        console.log(exception)
    }
    if (!isNaN(newPort)) {
        port = newPort
        continue
    }
    let pathPort = arg.split(">")
    console.log(`mapping ${chalk.blue(pathPort[0])} -> ${chalk.blueBright('localhost:' + pathPort[1])}`)
    target[pathPort[0]] = `localhost:${pathPort[1]}`

}

console.log(`listening on: ${chalk.green(port)}`)
const proxyServer = http.createServer((req, res) => {
    simpleProxy(req, res, {
        target: target
    });
}).listen(port);
