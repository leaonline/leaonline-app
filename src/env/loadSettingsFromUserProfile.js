import { TTSengine } from '../components/Tts'
import { Log } from '../infrastructure/Log'

/**
 * Extracts settings from user profile, like
 * - tts speed
 * - tts voice
 * - font size
 *
 * and applies them to the respective components.
 * Make sure it receives a user object or don't call it.
 *
 * @param user {object} the user document
 * @throws {Error} if no user doc is given
 */
export const loadSettingsFromUserProfile = user => {
  debug('load settings from user')
  if (!user) {
    throw new Error('Cannot load settings without user profile')
  }

  const { voice, speed } = user

  if (typeof voice === 'string') {
    TTSengine.setVoice(voice)
  }

  if (typeof speed === 'number') {
    TTSengine.updateSpeed(speed)
  }
}

const debug = Log.create(loadSettingsFromUserProfile.name, 'debug')
