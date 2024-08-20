/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { HTTP } from 'meteor/jkuester:http'
import {
  defaultDDPLoginName,
  getOAuthDDPLoginHandler
} from 'meteor/leaonline:ddp-login-handler'
import { rateLimitAccounts } from '../infrastructure/factories/rateLimit'
import { onAccountLoginHandler } from '../api/accounts/onAccountLoginHandler'
import { publishDefaultAccountFields } from '../api/accounts/publishDefaultAccountFields'
import { ClientConnection } from '../contexts/connection/ClientConnection'

//  //////////////////////////////////////////////////////////
//  RATE LIMIT BUILTIN ACCOUNTS
//  //////////////////////////////////////////////////////////
rateLimitAccounts()

//  //////////////////////////////////////////////////////////
//  OAUTH2 SETUP
//  //////////////////////////////////////////////////////////
Meteor.startup(async () => {
  const { oauth } = Meteor.settings
  await ServiceConfiguration.configurations.upsertAsync(
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
})



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
    speed: 1,
    isDev: 1,
    createdAt: 1,
    lastLogin: 1
  }
})

Accounts.onLogin(async info => {
  if (!info.allowed) { return }
  await ClientConnection.onLogin(info)
  await onAccountLoginHandler(info)
})

// //////////////////////////////////////////////////////////
// default publish fields override
// //////////////////////////////////////////////////////////
Meteor.publish(null, publishDefaultAccountFields)
