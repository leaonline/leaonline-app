import Meteor from '@meteorrn/core'

/**
 * Updates user profile fields that users can leverage to customize
 * certain behavior of the app.
 * @param voice {string}
 * @param speed {number}
 * @param onError {function}
 * @param onSuccess {function}
 */
export const updateUserProfile = ({ voice, speed, onError, onSuccess }) => {
  // TODO use Config.methods
  Meteor.call('users.methods.updateProfile', { voice, speed }, (err) => {
    if (err) {
      return onError(err)
    }
    return onSuccess()
  })
}
