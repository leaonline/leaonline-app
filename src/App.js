import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import * as Font from 'expo-font'
import AppLoading from 'expo-app-loading'
import * as Speech from 'expo-speech'
import { TTSengine } from './components/Tts'
import Navigator from './navigation/navigator'
import { createStyleSheet } from './styles/createStyleSheet'
import './i18n'

/**
 * @private used to load our custom font
 * @return {Promise<void>}
 */
const fetchFonts = () => {
  return Font.loadAsync({
    semicolon: require('./assets/fonts/SemikolonPlus-Regular.ttf')
  })
}

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
TTSengine.setSpeech(Speech)

/**
 * Main Application entry point
 * @category Global
 * @component
 * @returns {JSX.Element}
 */
export default function App () {
  const [fontLoaded, setFontLoaded] = useState(false)
  const [waitForInterval, setWaitThreeSeconds] = useState(false)

  // use this effect to make the splash screen remain
  // for a few seconds, once the font has been loaded
  useEffect(() => {
    if (fontLoaded) {
      // TODO Timeout variable should be later set in a separate global environment file
      setTimeout(() => {
        setWaitThreeSeconds(true)
      }, 1000)
    }
  }, [fontLoaded])

  if (!waitForInterval) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontLoaded(true)}
        onError={(error) => console.warn(error)}
      />
    )
  }

  return (
    <View style={styles.screen}>
      <Navigator />
    </View>

  )
}
