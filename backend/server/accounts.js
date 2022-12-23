/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { HTTP } from 'meteor/jkuester:http'
import {
  defaultDDPLoginName,
  getOAuthDDPLoginHandler
} from 'meteor/leaonline:ddp-login-handler'
import { rateLimitAccounts } from '../infrastructure/factories/rateLimit'

//  //////////////////////////////////////////////////////////
//  RATE LIMIT BUILTIN ACCOUNTS
//  //////////////////////////////////////////////////////////
rateLimitAccounts()

//  //////////////////////////////////////////////////////////
//  OAUTH2 SETUP
//  //////////////////////////////////////////////////////////
Meteor.startup(() => {
  setupOAuth()
})

function setupOAuth () {
  const { oauth } = Meteor.settings
  ServiceConfiguration.configurations.upsert(
    { service: 'lea' },
    {
      $set: {
        loginStyle: 'popup',
        clientId: oauth.clientId,
        secret: oauth.secret,
        dialogUrl: oauth.dialogUrl,
        accessTokenUrl: oauth.accessTokenUrl,
        identityUrl: oauth.identityUrl,
        redirectUrl: oauth.redirectUrl
      }
    }
  )

  const loginHandler = getOAuthDDPLoginHandler({
    identityUrl: oauth.identityUrl,
    httpGet: (url, requestOptions) => HTTP.get(url, requestOptions),
    debug: console.debug
  })

  Accounts.registerLoginHandler(defaultDDPLoginName, loginHandler)
}

// //////////////////////////////////////////////////////////
// Default accounts settings
// //////////////////////////////////////////////////////////
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

// //////////////////////////////////////////////////////////
// default publish fields override
// //////////////////////////////////////////////////////////
Meteor.publish(null, function () {
  const { userId } = this

  // skip this for non-logged in users
  if (!userId) return this.ready()

  return Meteor.users.find(userId, { fields: { email: 0, services: 0 } })
})
