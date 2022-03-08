import { Meteor } from 'meteor/meteor'
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
