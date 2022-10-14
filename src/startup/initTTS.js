// inject expo-speech as our current
// speech-synthesis implementation
import { TTSengine } from '../components/Tts'
import * as Speech from 'expo-speech'
import { Vibration } from 'react-native'

export const initTTs = async () => {
  TTSengine.setSpeech(Speech, { speakImmediately: true })
  TTSengine.on('beforeSpeak', () => Vibration.vibrate(150))
}
