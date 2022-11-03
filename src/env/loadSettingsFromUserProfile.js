import { TTSengine } from '../components/Tts'

export const loadSettingsFromUserProfile = user => {
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
