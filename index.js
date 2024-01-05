#!/usr/bin/env node
const net = require('net')
const http = require('http')
const simpleProxy = require('./proxy')
const chalk = require('chalk')
const { exception, log } = require('console')
let port = -1
let args = process.argv.slice(2)
async function start() {
  let targets = {}
  let verbose = false

  if (args.length === 0) {
    usageAndExit()
  }
  for (let arg of args) {
    if (arg === '-v') {
      verbose = true
      continue
    }

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
    let pathPort = arg.split('>')
    targets[pathPort[0]] = `localhost:${pathPort[1]}`
  }
  if (port === -1) {
    usageAndExit('No port specified')
  }
  await checkPortAvailability(port)

  // iterate over targets
  for (let [key, value] of Object.entries(targets)) {
    process.stdout.write(`${chalk.yellow('slp:')} mapping ${chalk.greenBright(key)} -> ${chalk.blueBright(value)} `)
    let i = 0
    for (i = 0; i < 10; i++) {
      try {
        await waitForPort(value)
        break
      } catch (exception) {
        // swallow
      }
      process.stdout.write('.')
      await delay(1000)
    }
    if (i === 10) {
      process.stdout.write(chalk.red('✗\n'))
      console.log(chalk.red(`Could not connect to ${value}`))
      process.exit(1)
    }
    // log green checkmark
    console.log(chalk.green('✓'))
  }
  console.log(`${chalk.yellow('slp:')} listening on: ${chalk.green(port)}`)

  let server = http.createServer((req, res) => {
    simpleProxy(req, res, {
      target: targets,
      verbose: verbose,
    })
  })
  server.listen(port)
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForPort(hostAndPort) {
  return new Promise((resolve, reject) => {
    const [host, port] = hostAndPort.split(':')
    const socket = new net.Socket()
    socket.setTimeout(1000)
    socket.on('connect', () => {
      socket.destroy()
      resolve()
    })
    socket.on('timeout', () => {
      socket.destroy()
      reject()
    })
    socket.on('error', (err) => {
      socket.destroy()
      reject(err)
    })
    socket.connect(port, host)
  })
}

async function checkPortAvailability(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        usageAndExit(`Port ${port} is already in use`)
      }
      reject(err)
    })
    server.listen(port, () => {
      server.close()
      resolve()
    })
  })
}

function usageAndExit(message) {
  if (message) {
    // log error message
    console.log(chalk.redBright(message) + '\n')
  }
  console.log(`${chalk.blue('Usage: single-line-proxy <pattern> <pattern> <port> [-v]')}`)
  console.log('Example: single-line-proxy "/(.*)>3002" "/api/(.*)>3001" 3000')
  process.exit(1)
}
// Call start
;(async () => {
  await start()
})()
