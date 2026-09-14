import { getUsersCollection } from '../../api/collections/getUsersCollection'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * Updates a given user profile with the respective fields.
 * Assumes that your Methods have validated inputs already.
 * @async
 * @param options {object}
 * @param options.userId {string} the _id of the user document
 * @param options.voice {string=} the current selected voice
 * @param options.speed {number=} the current selected speed for voices
 * @param options.device {object=} the current device info
 * @return {number} 1 if updated, 0 if not
 */
export const updateUserProfile = async ({ userId, voice, speed, device }) => {
  const query = { _id: userId }
  const updateDoc = { $set: {} }

  if (!voice && !speed && !device) {
    log('skip update; none of voice/speed/device')
    return 0
  }

  if (voice) {
    updateDoc.$set.voice = voice
  }

  if (speed) {
    updateDoc.$set.speed = speed
  }

  if (device) {
    updateDoc.$set.device = device
  }

  return getUsersCollection().updateAsync(query, updateDoc)
}

const log = createLog({
  name: updateUserProfile.name,
  type: 'log'
})
