import { Meteor } from 'meteor/meteor'
import { DDP } from 'meteor/ddp-client'

/**
 * Manages connection and calls to the content server.
 * @category api
 * @namespace
 */
const ContentConnection = {}

let contentConnection
const contentUrl = Meteor.settings.remotes.content.url

/**
 * Establishes a basic, unauthenticated connection.
 * @param log {function} log function
 * @return {Promise<void>}
 */
ContentConnection.connect = ({ log }) => {
  return new Promise((resolve, reject) => {
    log('establish connection to', contentUrl)
    contentConnection = DDP.connect(contentUrl, {
      retry: false,
      onConnected: err => {
        if (err) {
          console.error(err)
          return reject(err)
        }

        log('connection established with', contentUrl)
        resolve()
      }
    })
  })
}

/**
 * Returns, whether the connection is fully established
 * @return {boolean}
 */
ContentConnection.isConnected = () => contentConnection
  ? contentConnection.status().status === 'connected'
  : false

/**
 * Get doc(s) from a collection
 * @param name {string} name of the context to get docs from
 * @param ids {Array?} optional array of ids to get
 * @param log
 * @return {Promise}
 */
ContentConnection.get = ({ name, ids = [], log }) => {
  return new Promise((resolve) => {
    const methodName = ids.length > 0
      ? `${name}.methods.get`
      : `${name}.methods.getAll`

    const token = getToken({ name: methodName })
    const params = { token }

    if (ids.length > 0) {
      params.ids = ids
    }

    log('call', methodName)
    contentConnection.call(methodName, params, (err, res) => {
      if (err) {
        log(err.message)
        return resolve([])
      }

      return resolve(res)
    })
  })
}

/// /////////////////////////////////////////////////////////////////////////////
//
//  INTERNAL* @obj
//
/// /////////////////////////////////////////////////////////////////////////////

/**
 * generates a function to create jwt
 * @private
 */
const getToken = (function () {
  const { content } = Meteor.settings.remotes
  const nJwt = require('njwt')
  const signingKey = content.jwt.key
  const url = Meteor.absoluteUrl()
  const claims = {
    iss: url.substring(0, url.length - 1), // The URL of your service
    sub: content.jwt.sub // The UID of the user in your system
  }

  return ({ name }) => {
    const jwt = nJwt.create({ scope: name, ...claims }, signingKey)
    jwt.setExpiration(new Date().getTime() + (60 * 1000)) // One minute from now
    return jwt.compact()
  }
})()

export { ContentConnection }
