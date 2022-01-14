import Meteor from '@meteorrn/core'
import { callMeteor } from './call'
import * as SecureStore from 'expo-secure-store'

const usernameKey = 'lea-app-username'

export const deleteAccount = ({ prepare, receive, failure, success } = {}) => {
  const user = Meteor.user()

  if (!user) { throw new Error('notLoggedIn') }

  return callMeteor({
    name: 'deleteMobileAccount',
    args: user,
    prepare,
    receive,
    failure,
    success: async (deleted) => {
      if (!deleted) {
        return failure(new Error('notDeleted'))
      }

      await SecureStore.deleteItemAsync(usernameKey)

      return success(deleted)
    }
  })
}
