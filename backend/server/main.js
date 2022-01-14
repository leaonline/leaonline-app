import { Ramdom } from 'meteor/random'

Meteor.onConnection(function (...args) {
  console.debug('connection established')
  console.debug(...args)
})

Meteor.methods({
  test () {
    return 'hello world'
  }
})

Meteor.methods({
  createMobileUser () {
    const code = Random.id(5).toUpperCase()
    const userId  = Accounts.createUser({ username: code, password: code })
    return Meteor.users.findOne(userId, { fields: { services: 0 } })
  },

  deleteMobileAccount (user = {}) {
    const { _id, username } = user

    if (Meteor.users.find({ _id, username }).count() === 0) {
      throw new Error('deleteAccountFailed')
    }

    return !!Meteor.users.remove({ _id, username })
  }
})
