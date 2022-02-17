import Meteor from '@meteorrn/core'
import { MeteorLoginStorage } from './MeteorLoginStorage'
import { ensureConnected } from './ensureConnected'
import { MeteorError } from '../errors/MeteorError'
import { AuthenticationError } from '../errors/AuthenticationError'
import { asyncTimeout } from '../utils/asyncTimeout'
import { Log } from '../infrastructure/Log'

/**
 * Attempts a login to the Meteor backend.
 *
 * Resolves to an error, if
 * - no connection is established to the backend
 * - no credentials are stored
 *
 * Otherwise, resolves to the logged-in user object (document)
 *
 * @throws {ConnectionError} if not connected
 * @throws {Error} if any error
 * @return {Promise<Object>}
 */
export const loginMeteor = async () => {
  // skip if user exists, since there is no further login required
  if (Meteor.user()) { return Meteor.user() }

  // login requires a connection, which is why you should always
  // handle exceptions in the screen calling to this function
  ensureConnected()

  const { username, password } = await MeteorLoginStorage.getCredentials()

  if (!username || !password) {
    throw new AuthenticationError('noCredentials')
  }

  try {
    return await loginWithPassword(username, password)
  } catch (e) {
    if (e.error === 'too-many-requests') {
      Log.warn(e.message)
      Log.warn('reattempt login in 500ms')
      await asyncTimeout(500)
      return loginMeteor()
    }

    if (e.reason === 'notConnected') {
      Log.warn(e.message)
      Log.warn('reattempt login in 1000ms')
      await asyncTimeout(1000)
      return loginMeteor()
    }

    // other errors er rethrown
    throw e
  }
}

/**
 * The actual login call, wrapped in a promise
 * @private
 */
const loginWithPassword = (username, password) => new Promise((resolve, reject) => {
  Meteor.loginWithPassword({ username }, password, (error) => {
    if (error) {
      // we convert server responses to MeteorError
      reject(MeteorError.from(error))
    } else {
      resolve(Meteor.user())
    }
  })
})
