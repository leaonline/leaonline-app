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
 * @async
 * @return {Promise<void>}
 */
ContentConnection.connect = function connect ({ log, timeout = 5000 } = {}) {
  return new Promise((resolve, reject) => {
    if (log) log('establish connection to', contentUrl)
    let connected = false
    const onError = err => {
      clearTimeout(timer)
      contentConnection?.disconnect()
      return reject(err)
    }
    const timer = setTimeout(() => {
      if (!connected) {
        return onError(new Meteor.Error('errors.notConnected', 'remote.timeOut', { contentUrl, timeout }))
      }
      clearTimeout(timer)
    }, timeout)
    contentConnection = DDP.connect(contentUrl, {
      retry: false,
      onConnected: err => {
        if (err) {
          return onError(err)
        }

        if (log) log('connection established with', contentUrl, contentConnection)
        connected = true
        clearTimeout(timer)
        resolve()
      }
    })
  })
}

/**
 * Returns, whether the connection is fully established
 * @return {boolean}
 */
ContentConnection.isConnected = function isConnected () {
  if (typeof contentConnection?.status !== 'function') {
    return false
  }
  return contentConnection.status()?.status === 'connected'
}
/**
 * Get doc(s) from a collection
 * @param name {string} name of the context to get docs from
 * @param ids {Array?} optional array of ids to get
 * @param log
 * @return {Promise}
 */
ContentConnection.get = function get ({ name, ids = [], log }) {
  return new Promise((resolve) => {
    const methodName = ids.length > 0
      ? `${name}.methods.get`
      : `${name}.methods.getAll`

    const token = getToken({ name: methodName })
    const params = { token }

    if (ids.length > 0) {
      params.ids = ids
    }

    if (log) log('call', methodName)
    contentConnection.call(methodName, params, (err, res) => {
      if (err) {
        if (log) {
          log(err.message)
        }
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
