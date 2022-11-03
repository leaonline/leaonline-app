import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

// default accounts settings

Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: true,
  loginExpirationInDays: null,
  ambiguousErrorMessages: true,
  defaultFieldSelector: {
    _id: 1,
    username: 1,
    voice: 1,
    speed: 1
  }
})

// default publish fields override

Meteor.publish(null, function () {
  const { userId } = this

  // skip this for non-logged in users
  if (!userId) return this.ready()

  return Meteor.users.find(userId, { fields: { email: 0, services: 0 } })
})
