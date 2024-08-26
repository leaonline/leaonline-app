import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { TTSSettings } from '../TTSSettings'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'

export const TTSProfileScreen = () => {
  return (
    <ScrollView persistentScrollbar>
      <SafeAreaView style={styles.container}>
        <TTSSettings containerStyle={styles.tts} />
      </SafeAreaView>
    </ScrollView>
  )
}
const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  tts: {
    flex: 1
  }
})
