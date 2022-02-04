import * as SecureStore from 'expo-secure-store/build/SecureStore'
import { check } from '../schema/check'

// TODO get this from config / dot env etc.
const usernameKey = 'lea-app-username'
const userPwKey = 'lea-app-pw'

/**
 * Handles login credentials
 */
export const MeteorLoginStorage = {}

MeteorLoginStorage.setCredentials = async ({ username, password }) => {
  check(username, String)
  check(password, String)

  await SecureStore.setItemAsync(usernameKey, username)
  await SecureStore.setItemAsync(userPwKey, password)
}

MeteorLoginStorage.getCredentials = async () => {
  const username = await SecureStore.getItemAsync(usernameKey)
  const password = await SecureStore.getItemAsync(userPwKey)

  return { username, password }
}

MeteorLoginStorage.hasLogin = async () => {
  const username = await SecureStore.getItemAsync(usernameKey)
  const password = await SecureStore.getItemAsync(userPwKey)

  return !!username && !!password
}

MeteorLoginStorage.deleteCredentials = async () => {
  await SecureStore.deleteItemAsync(usernameKey)
  await SecureStore.deleteItemAsync(userPwKey)
}
