import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as Font from 'expo-font'
import AppLoading from 'expo-app-loading'

import Navigator from './navigation/navigator'

const fetchFonts = () => {
  return Font.loadAsync({
    semicolon: require('./assets/fonts/SemikolonPlus-Regular.ttf')

  })
}

export default function App () {
  const [fontLoaded, setFontLoaded] = useState(false)
  const [waitForInterval, setWaitThreeSeconds] = useState(false)

  useEffect(() => {
    if (fontLoaded) {
      //TODO Timeout variable should be later set in a separate global environment file
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

const styles = StyleSheet.create({
  screen: {
    flex: 1
  }

})
