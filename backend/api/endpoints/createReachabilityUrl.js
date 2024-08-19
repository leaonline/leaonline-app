import { WebApp } from 'meteor/webapp'
import { createLog } from '../../infrastructure/log/createLog'

const paths = new Set()
export const createReachabilityUrl = ({ path }) => {
  if (paths.has(path)) {
    throw new Error(`Path ${path} already taken!`)
  }

  paths.add(path)
  const log = createLog({ name: path })

  WebApp.rawConnectHandlers.use(path, function (req, res) {
    log('check', req.headers)
    res.writeHead(204)
    res.end()
  })
}
