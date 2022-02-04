import Meteor from '@meteorrn/core'
import { callMeteor } from './call'
import { hasLogin } from './hasLogin'
import { loginMeteor } from './loginMeteor'
import { Log } from '../infrastructure/Log'
import { MeteorLoginStorage } from './MeteorLoginStorage'
import { check } from '../schema/check'


const createUserMethodName = 'createMobileUser' // TODO get this from config / dot env etc.
const debug = Log.create('createUser', 'debug')

/**
 * Creates a new user-account on the Meteor server.
 *
 * If there is a current logged-in user, this method will resolve to the current
 * user object.
 *
 *
 * @param override {boolean} flag that is used to override an already saved login
 * @return {Promise<Object>} promise, that resolves to a user-account object (document)
 */
export const createUser = async ({ email, override = true } = {}) => {
  check(override, Boolean)

  if (Meteor.user()) {
    debug('user exists and is logged in')
    return Meteor.user()
  }

  const loginExists = await hasLogin()
  debug('login exists:', loginExists)

  if (!loginExists || override) {
    debug('create user, override:', override)
    await createNewUser({ email })
  }

  // if user creation is successful we try to login
  // and return the logged-in user
  debug('attempt login')
  return await loginMeteor()
}

/**
 * The actual call to the user-creation method on the server
 * @private
 */
const createNewUser = async ({ email }) => {
  debug('create user in backend')
  const { user, password } = await callMeteor({ name: createUserMethodName, args: { email } })

  if (!user) {
    throw new Error('no user has been created')
  }

  if (!password) {
    throw new Error('no secret has been created')
  }

  debug('store user credentials')

  // update the credentials in a secure place
  await MeteorLoginStorage.setCredentials({
    username: user.username,
    password: password
  })


  return user
}
