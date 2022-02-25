import { Meteor } from 'meteor/meteor'
require('dotenv').config()
console.log(process.env.ALGORITHM)
import { ContentServer } from '../api/remotes/ContentServer'

Meteor.startup(() => {
  Meteor.defer(() => {
    ContentServer.init()
  })
})

Meteor.onConnection(function (...args) {
  console.debug('connection established')
  console.debug(...args)
})
