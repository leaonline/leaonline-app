import Meteor from '@meteorrn/core'
import { check } from '../schema/check'
import { ensureConnected } from './ensureConnected'
import { MeteorError } from '../errors/MeteorError'
import { Log } from '../infrastructure/Log'
import { createSchema } from '../schema/createSchema'

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
 * @param options {object} options object argument
 * @param options.name {string} name of the Meteor method to call
 * @param options.args {object} key/value pairs of arguments for the method call.
 * @param options.prepare {function?} optional function to be called right before the
 *                            request is started
 * @param options.receive {function?} optional function to be called once any response
 *                            has been received from the server
 * @param options.success {function?} optional function called when response is received
 *                            and no error is passed as first argument
 * @param options.failure {function?} optional function called when response is received
 *                            and the first argument is not undefined
 * @param options.debug {boolean=} optional flag to debug internal behaviour
 * @return {Promise<any>} a promise, resolving to anything (depending on the
 *                        method implementation on the server)
 */
export const callMeteor = (options) => {
  check(options, callMethodSchema)
  ensureConnected()
  const {
    name,
    args = undefined,
    prepare = undefined,
    receive = undefined,
    success = undefined,
    failure = undefined,
    debug = false
  } = options

  const debugLog = debug
    ? Log.create(name, 'debug')
    : () => {}
  debugLog('call with', { args })
  const promise = call({ name, args, prepare, receive })

  if (typeof success === 'function') {
    promise.then(success)
  }

  // if we provide a failure handler
  // then we pipe any error through it
  // otherwise we need to prevent unhandledPromiseRejection
  // by adding a default catch handler
  if (typeof failure === 'function') {
    promise.catch(failure)
  } else {
    promise.catch(error => debugLog('error received from backend', error.message))
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
  if (typeof prepare === 'function') { prepare() }

  Meteor.call(name, args, (error, result) => {
    // inform that we are have received
    // something back from the server
    if (typeof receive === 'function') { receive() }

    if (error) {
      // we convert server responses to MeteorError
      return reject(MeteorError.from(error))
    }

    return resolve(result)
  })
})

const optionalFunction = { type: Function, optional: true }
const callMethodSchema = createSchema({
  name: String,
  args: {
    optional: true,
    type: Object,
    blackbox: true
  },
  prepare: optionalFunction,
  receive: optionalFunction,
  success: optionalFunction,
  failure: optionalFunction,
  debug: {
    type: Boolean,
    optional: true
  }
})
