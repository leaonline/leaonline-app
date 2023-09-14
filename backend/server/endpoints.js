import { WebApp } from 'meteor/webapp'

WebApp.rawConnectHandlers.use('/reachability', function (req, res) {
  res.writeHead(204)
  res.end()
})
