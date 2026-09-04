import { WebApp } from 'meteor/webapp'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * Creates a URL to handle 204 HEAD requests on a given path.
 * This is intended for http-based reachability tests.
 * @param path {string}
 */
export const createReachabilityUrl = ({ path }) => {
  if (paths.has(path)) {
    throw new Error(`Path ${path} already taken!`)
  }

  paths.add(path)
  const log = createLog({ name: path })
  log('create reachability endpoint at', path)

  WebApp.handlers.use(path, function (req, res) {
    log('check by', req.headers?.host)
    res.append('Access-Control-Expose-Headers', 'Content-Length')
    res.append('Content-Length', 0)
    res.status(204)
    res.end()
  })
}

/** @private */
const paths = new Set()
