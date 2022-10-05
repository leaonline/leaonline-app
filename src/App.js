import React from 'react'
import { View, Vibration } from 'react-native'

import * as Speech from 'expo-speech'
import { loggedIn } from './meteor/loggedIn'
import { TTSengine } from './components/Tts'
import Navigator from './navigation/navigator'
import { createStyleSheet } from './styles/createStyleSheet'
import './startup/initContexts'
import './i18n'
import useSplashScreen from './hooks/useSplashScreen'

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  screen: {
    flex: 1
  }
})

// inject expo-speech as our current
// speech-synthesis implementation
TTSengine.setSpeech(Speech, { speakImmediately: true })
TTSengine.on('beforeSpeak', () => Vibration.vibrate(150))

/**
 * Main Application entry point
 * @category Global
 * @component
 * @returns {JSX.Element}
 */
export default function App () {
  const { appIsReady, onLayoutRootView } = useSplashScreen()

  if (!appIsReady) {
    return null
  }

  return (
    <View style={styles.screen} onLayout={onLayoutRootView}>
      <Navigator loggedIn={!!loggedIn()} />
    </View>
  )
}
