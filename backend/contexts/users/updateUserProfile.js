import { Meteor } from 'meteor/meteor'

/**
 * Updates a given user profile with the respective fields.
 * Assumes that your Methods have validated inputs already.
 * @param options {object}
 * @param options.userId {string} the _id of the user document
 * @param options.voice {string=} the current selected voice
 * @param options.speed {number=} the current selected speed for voices
 * @return {number} 1 if updated, 0 if not
 */
export const updateUserProfile = ({ userId, voice, speed }) => {
  const query = { _id: userId }
  const updateDoc = { $set: {} }

  if (voice) {
    updateDoc.$set.voice = voice
  }

  if (speed) {
    updateDoc.$set.speed = speed
  }

  return Meteor.users.update(query, updateDoc)
}
