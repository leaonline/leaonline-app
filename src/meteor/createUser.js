import Meteor from '@meteorrn/core'
import { callMeteor } from './call'
import { hasLogin } from './hasLogin'
import { Log } from '../infrastructure/Log'
import { MeteorLoginStorage } from './MeteorLoginStorage'
import { check } from '../schema/check'
import { createSchema, RegEx } from '../schema/createSchema'


/**
 * Creates a new user-account on the Meteor server.
 *
 * If there is a current logged-in user, this method will resolve to the current
 * user object.
 *
 *
 * @param override {boolean} flag that is used to override an already saved login
 * @return {Promise<Object|null>} promise, that resolves to a user-account object (document)
 */
export const createUser = async ({ email, override = false } = {}) => {
  check({ email, override }, schema, { debug: true })

  if (Meteor.user()) {
    debug('user exists and is logged in')
    return Meteor.user()
  }

  const loginExists = await hasLogin()
  debug('login exists:', loginExists)

  // we only create a new user if there is no login yet or
  // we explicitly override it using the override flag
  if (!loginExists || override) {
    debug('create user, override:', override)
    return await createNewUser({ email })
  }

  // return null indicates, that no new user has been created
  return null
}

// INTERNALS

const createUserMethodName = 'createMobileUser' // TODO get this from config / dot env etc.
const debug = Log.create('createUser', 'debug')
const schema = createSchema({
  email: {
    type: String,
    optional: true,
    regEx: RegEx.EmailWithTLD
  },
  override: Boolean
})

const responseSchema = createSchema({
  user: createSchema({
    _id: String,
    username: String,
    email: {
      type: String,
      optional: true
    }
  }),
  password: String
})

/**
 * The actual call to the user-creation method on the server
 * @private
 */
const createNewUser = async ({ email }) => {
  debug('create user in backend')
  const response = await callMeteor({ name: createUserMethodName, args: { email } })

  try {
    responseSchema.validate(response || {})
  } catch (e) {
    const err = new Error('invalidResponse')
    err.details = e.message
    throw err
  }

  const user = response .user
  const password = response .password

  debug('store user credentials')

  // update the credentials in a secure place
  await MeteorLoginStorage.setCredentials({
    username: user.username,
    password: password
  })


  return user
}
