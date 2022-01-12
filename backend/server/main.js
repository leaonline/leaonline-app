import DDP from 'meteor/ddp-server'

Meteor.onConnection(function (...args) {
  console.debug(...args)
})

Meteor.methods({
  test () {
    return 'hello world'
  }
})