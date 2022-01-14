import Meteor from '@meteorrn/core'
import * as SecureStore from 'expo-secure-store';
import { callMeteor } from './call'
import { hasLogin } from './hasLogin'
import { loginMeteor } from './loginMeteor'
import { Log } from '../infrastructure/Log'

// TODO get this from config / dot env etc.
const usernameKey = 'lea-app-username'
const debug = Log.create('createUser', 'debug')

export const createUser = async ({ override = true} = {}) => {
  if (Meteor.user()) {
    debug('user exists and is logged in')
    return Meteor.user()
  }

  const loginExists = await hasLogin()
  debug('user credentials exist and is logged in')

  if (!loginExists || override) {
    await createNewUser()
  }

  return await loginMeteor()
}

const createNewUser = async () => {
  const user = await callMeteor({ name: 'createMobileUser' })

  if (!user) {
    throw new Error('no user has been created')
  }

  // update the current username in a secure place
  await SecureStore.setItemAsync(usernameKey, user.username)

  return user
}
