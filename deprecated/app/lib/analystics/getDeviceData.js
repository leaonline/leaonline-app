import { Platform, PixelRatio, Dimensions, AccessibilityInfo, Appearance } from 'react-native'
import { isAvailableAsync } from 'expo-secure-store'
import { maxSpeechInputLength, getAvailableVoicesAsync } from 'expo-speech'
import Constants from 'expo-constants'
import { Log } from '../infrastructure/Log'
import { createTimedPromise } from '../utils/createTimedPromise'

export const getDeviceData = async () => {
  const data = {}

  debug('get platform info')
  data.platform = {
    name: Platform.OS,
    version: String(Platform.version),
    isTesting: Platform.isTesting,
    isPad: Platform.isPad,
    isTV: Platform.isTV,
    deviceName: Constants.deviceName,
    systemVersion: Constants.systemVersion,
    ...Platform.constants
  }

  debug('get display info')
  data.display = {
    ratio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    preferredTheme: Appearance.getColorScheme(),
    statusBar: {},
    window: {},
    screen: {}
  }

  data.display.statusBar.height = Constants.statusBarHeight

  const window = Dimensions.get('window')
  data.display.window.width = window.width
  data.display.window.height = window.height

  const screen = Dimensions.get('screen')
  data.display.screen.width = screen.width
  data.display.screen.height = screen.height

  debug('get tts info')
  data.tts = {}
  data.tts.maxInputLength = maxSpeechInputLength

  const voices = await load(getAvailableVoicesAsync(), [])
  data.tts.availableVoices = (voices || [])
    .filter(v => langPattern.test(v.language))
    .map(v => v.identifier)

  debug('get accessibility info')
  data.accessibility = {}
  data.accessibility.enabled = await load(AccessibilityInfo.isAccessibilityServiceEnabled())
  data.accessibility.boldText = await load(AccessibilityInfo.isBoldTextEnabled())
  data.accessibility.grayScale = await load(AccessibilityInfo.isGrayscaleEnabled())
  data.accessibility.invertedColor = await load(AccessibilityInfo.isInvertColorsEnabled())
  data.accessibility.reducedMotion = await load(AccessibilityInfo.isReduceMotionEnabled())
  data.accessibility.reduceTransparency = await load(AccessibilityInfo.isReduceTransparencyEnabled())
  data.accessibility.screenReader = await load(AccessibilityInfo.isScreenReaderEnabled())
  data.accessibility.preferCrossFade = await load(AccessibilityInfo.prefersCrossFadeTransitions())

  debug('get storage info')
  data.storage = {}
  data.storage.secureStoreAvailable = await load(isAvailableAsync())

  debug('all collected')
  return data
}

const langPattern = /de[-_]+/i
const debug = Log.create('getDeviceInfo', 'debug')
const load = (p, msg = 'timed.out', t = 100) => createTimedPromise(p, {
  timeout: t,
  message: msg,
  throwIfTimedOut: false
})
