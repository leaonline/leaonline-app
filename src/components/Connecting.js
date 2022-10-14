import React  from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { useTranslation } from 'react-i18next'
import { TTSengine } from './Tts'

const Tts = TTSengine.component()

const styles = createStyleSheet({
  container: Layout.containter(),
  indicator: {
    height: 50
  }
})

export const Connecting = () => {
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <ActivityIndicator style={styles.indicator} />
      <Tts text={t('connecting.title')} align='center' />
    </View>
  )
}