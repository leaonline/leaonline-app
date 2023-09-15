import { WebApp } from 'meteor/webapp'

const paths = new Set()

export const createReachabilityUrl = ({ path }) => {
  if (paths.has(path)) {
    throw new Error(`Path ${path} already taken!`)
  }

  paths.add(path)
  WebApp.rawConnectHandlers.use(path, function (req, res) {
    res.writeHead(204)
    res.end()
  })
}
