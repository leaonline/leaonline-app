import React from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { useTts } from '../../../components/Tts'
import { useTranslation } from 'react-i18next'
import { TTSSettings } from '../TTSSettings'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'
import { Colors } from '../../../constants/Colors'

export const TTSProfileScreen = () => {
  const { Tts } = useTts()
  const { t } = useTranslation()

  return (
    <ScrollView persistentScrollbar>
      <SafeAreaView style={styles.container}>
        <TTSSettings containerStyle={styles.tts}/>
      </SafeAreaView>
    </ScrollView>
  )
}
const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  scroll: {},
  tts: {
    flex: 1
  },
  accounts: {
    flex: 1
  },
  headline: {
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 5
  },
  headlineText: {
    fontWeight: 'bold'
  },
  achievementsButton: {
    backgroundColor: Colors.secondary
  },
  achievementButtonTitle: {
    color: Colors.white
  }
})
