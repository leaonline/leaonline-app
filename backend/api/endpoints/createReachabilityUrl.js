import { WebApp } from 'meteor/webapp'

export const createReachabilityUrl = ({ path }) => {
  WebApp.rawConnectHandlers.use(path, function (req, res) {
    res.writeHead(204)
    res.end()
  })
}
