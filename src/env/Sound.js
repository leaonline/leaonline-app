import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import { Log } from '../infrastructure/Log'

export const Sound = {}

Sound.init = async () => {
  return Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    playThroughEarpieceAndroid: true
  })
}

Sound.load = (name, soundRef) => {
  internal.refs.set(name, soundRef)
}

const internal = {
  refs: new Map(),
  current: null
}

Sound.play = async (name) => {
  await Sound.unload()

  try {
    const loadFn = internal.refs.get(name)
    const soundRef = loadFn()
    internal.current = await Audio.Sound.createAsync(soundRef)
    const { playableDurationMillis } = internal.current.status

    await internal.current.sound.playAsync()
    setTimeout(() => Sound.unload(), playableDurationMillis)
  } catch (error) {
    Log.error(error)
  }
}

Sound.unload = async () => {
  if (internal.current) {
    await unload(internal.current.sound)
    internal.current = null
  }
}

const unload = async (sound) => {
  try {
    await sound.unloadAsync()
  } catch (error) {
    Log.error(error)
  }
}