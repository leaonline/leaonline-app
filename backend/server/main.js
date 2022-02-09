import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'
import { encrypt } from './crypto'
import { createRestoreCode } from './createRestoreCode'

Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: true,
  loginExpirationInDays: null,
  ambiguousErrorMessages: true,
  defaultFieldSelector: {
    _id: 1,
    username: 1,
    restore: 1
  }
})

Meteor.publish(null, function () {
  const { userId } = this
  const user = Meteor.users.find(userId, { fields: { email: 0, services: 0 } })
  console.debug('sub:', user.fetch())
  return user
})

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
  createMobileUser (options) {
    const email = options?.email
    const username = Random.hexString(32)
    const password = Random.secret()
    const restore = [
      createRestoreCode(),
      createRestoreCode(),
      createRestoreCode()
    ]

    const userId  = Accounts.createUser({ username, password })
    const updateDoc = { restore }

    // email can be optional and is used for restoring accounts
    if (email) {
      updateDoc.email = encrypt(email)
    }

    Meteor.users.update(userId, { $set: updateDoc })

    const user = Meteor.users.findOne(userId, { fields: { services: 0 } })
    console.debug('user created:', user)


    return { user, password }
  },

  deleteMobileAccount (user = {}) {
    const { _id, username } = user

    if (Meteor.users.find({ _id, username }).count() === 0) {
      throw new Error('deleteAccountFailed')
    }

    return !!Meteor.users.remove({ _id, username })
  }
})
