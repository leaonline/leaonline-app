import { WebApp } from 'meteor/webapp'

WebApp.connectHandlers.use('/connectivity-status', function (req, res) {
  res.writeHead(204)
  res.end()
})
