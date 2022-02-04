import Meteor from '@meteorrn/core'
import { MeteorLoginStorage } from './MeteorLoginStorage'

/**
 * Attempts a login to the Meteor backend.
 *
 * Resolves to an error, if
 * - no connection is established to the backend
 * - no credentials are stored
 *
 * Otherwise, resolves to the logged-in user object (document)
 *
 * @return {Promise<*>}
 */
export const loginMeteor = async () => {
  // skip if user exists, since there is no further login required
  if (Meteor.user()) { return Meteor.user() }

  const status = Meteor.status()

  if (!status.connected) {
    throw new Error('notConnected')
  }

  const { username, password } = await MeteorLoginStorage.getCredentials()

  if (!username || !password) {
    throw new Error('noCredentials')
  }

  return loginWithPassword(username, password)
}

/**
 * The actual login call, wrapped in a promise
 * @private
 */
const loginWithPassword = (username, password) => new Promise((resolve, reject) => {
  Meteor.loginWithPassword({ username }, password, (error) => {
    if (error) {
      reject(error)
    }

    else {
      resolve(Meteor.user())
    }
  })
})
