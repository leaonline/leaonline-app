import { MeteorLoginStorage } from './MeteorLoginStorage'
import { callMeteor } from './call'
import { ensureLoggedIn } from './ensureLoggedIn'

const deleteAccountMethodName = 'deleteMobileAccount'

/**
 * Deletes a current user account and cleans the cached login credentials.
 *
 * @param prepare
 * @param receive
 * @param failure
 * @param success
 * @return {Promise<any>}
 */
export const deleteAccount = ({ prepare, receive, failure, success } = {}) => {
  const user = ensureLoggedIn()

  return callMeteor({
    name: deleteAccountMethodName,
    args: user,
    prepare,
    receive,
    failure,
    success: async (deleted) => {
      if (!deleted) {
        return failure(new Error('notDeleted'))
      }

      await MeteorLoginStorage.deleteCredentials()

      return success(deleted)
    }
  })
}
