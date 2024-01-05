const http = require('http')
const pathToRegexp = require('path-to-regexp')
const chalk = require('chalk')

module.exports = (req, res, options) => {
  const { target, protocol = 'http:', verbose = false } = options
  const urls = Object.keys(target).filter((pattern) => req.url.match(pathToRegexp(pattern)))
  if (urls.length === 0) return
  const [hostname, port = '80'] = target[urls[0]].split(':')
  const reqOptions = {
    protocol,
    hostname,
    port,
    path: req.url,
    headers: req.headers,
    method: req.method,
  }

  const req2 = http.request(reqOptions, (res2) => {
    if (verbose) {
      const host = hostname === 'localhost' ? '' : hostname
      const id = `${req.method} ${req.url} => ${host}:${port}`
      const c = chalk.greenBright
      // if non 2xx code, use red
      if (res2.statusCode >= 300) {
        c = chalk.redBright
      }
      console.log(`${chalk.yellow('slp:')} ${id} [${c(res2.statusCode)}]`)
    }
    res.writeHead(res2.statusCode, res2.headers)
    res2.pipe(res)
  })

  req2.on('error', (e) => {
    console.error(`${chalk.red(e.message)}`)
    res.writeHead(500)
    res.end()
  })

  req.pipe(req2)
}
