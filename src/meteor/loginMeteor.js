import Meteor from '@meteorrn/core'
import * as SecureStore from 'expo-secure-store'

// TODO get this from config / dot env etc.
const usernameKey = 'lea-app-username'

export const loginMeteor = async () => {
  if (Meteor.user()) {
    return Meteor.user()
  }

  const status = Meteor.status()

  if (!status.connected) {
    return { failed: 'notConnected' }
  }

  const username = await SecureStore.getItemAsync(usernameKey)

  if (!username) {
    return { failed: 'noCredentials' }
  }

  return loginWithPassword(username, username)
}

const loginWithPassword = (username, password) => new Promise((resolve, reject) => {
  Meteor.loginWithPassword({ username }, password, (error) => {
    if (error) {
      reject(error)
    } else {
      resolve(Meteor.user())
    }
  })
})
