import * as SecureStore from 'expo-secure-store'

const usernameKey = 'lea-app-username'

export const hasLogin = async () => {
  const username = await SecureStore.getItemAsync(usernameKey)
  return typeof username === 'string' && username.length === 5
}
