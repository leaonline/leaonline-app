import { getUsersCollection } from '../../api/collections/getUsersCollection'

/**
 * Updates a given user profile with the respective fields.
 * Assumes that your Methods have validated inputs already.
 * @param options {object}
 * @param options.userId {string} the _id of the user document
 * @param options.voice {string=} the current selected voice
 * @param options.speed {number=} the current selected speed for voices
 * @return {number} 1 if updated, 0 if not
 */
export const updateUserProfile = ({ userId, voice, speed, device }) => {
  const query = { _id: userId }
  const updateDoc = { $set: {} }

  if (voice) {
    updateDoc.$set.voice = voice
  }

  if (speed) {
    updateDoc.$set.speed = speed
  }

  if (device) {
    updateDoc.$set.device = device
  }

  return getUsersCollection().update(query, updateDoc)
}
