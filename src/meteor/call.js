import Meteor from '@meteorrn/core'
import { check } from '../schema/check'
import { ensureConnected } from './ensureConnected'

/**
 * Wraps a Meteor.call in a promise but also allows to hook in various
 * stages of the request. Always returns a promise.
 *
 * Meteor calls are rpc-style calls to an endpoint in our Meteor server.
 *
 * If failure callback is provided, it will automatically server as the catch
 * argument of the promise.
 *
 * Automatically resolves to {failure} when there is no active connection to
 * the Meteor server.
 *
 * @param name {string} name of the Meteor method to call
 * @param args {object} key/value pairs of arguments for the method call.
 * @param prepare {function?} optional function to be called right before the
 *                            request is started
 * @param receive {function?} optional function to be called once any response
 *                            has been received from the server
 * @param success {function?} optional function called when response is received
 *                            and no error is passed as first argument
 * @param failure {function?} optional function called when response is received
 *                            and the first argument is not undefined
 * @return {Promise<any>} a promise, resolving to anything (depending on the
 *                        method implementation on the server)
 */
export const callMeteor = ({ name, args = undefined, prepare = undefined, receive = undefined, success = undefined, failure = undefined }) => {
  check(name, String)
  ensureConnected()

  const promise = call({ name, args, prepare, receive })

  if (typeof success === 'function') {
    promise.then(success)
  }

  if (typeof failure === 'function') {
    promise.catch(failure)
  }

  return promise
}

/**
 * Internal actual method call. See {callMeteor} for functionality.
 * @private
 * @see {callMeteor}
 */
const call = ({ name, args, prepare, receive }) => new Promise((resolve, reject) => {
  // inform that we are connected and about to call the server
  if (prepare) { prepare() }

  Meteor.call(name, args, (error, result) => {
    // inform that we are have received
    // something back from the server
    if (typeof receive === 'function') { receive() }

    if (error) {
      return reject(error)
    }

    return resolve(result)
  })
})
