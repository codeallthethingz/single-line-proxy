#!/usr/bin/env node 
const http = require('http')
const simpleProxy = require('node-simple-proxy')
const chalk = require('chalk')
let port = 8000

let args = process.argv.slice(2)

let target = {}
for (arg of args) {
    let pathPort = arg.split(">")
    console.log(`mapping ${chalk.blue(pathPort[0])} -> ${chalk.blueBright('localhost:'+pathPort[1])}`)
    target[pathPort[0]] = `localhost:${pathPort[1]}`
}

console.log(`listening on: ${chalk.green(port)}`)
const proxyServer = http.createServer((req, res) => {
    // you can add custom logic here
    simpleProxy(req, res, {
        target: target
    });
}).listen(port);
