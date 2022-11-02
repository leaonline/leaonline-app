import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { useTranslation } from 'react-i18next'
import { useTts } from './Tts'

const styles = createStyleSheet({
  container: Layout.container(),
  indicator: {
    height: 50
  }
})

/**
 * Default visual for indicating to users, that we are connecting to the servers.
 * @returns {JSX.Element}
 * @component
 */
export const Connecting = () => {
  const { t } = useTranslation()
  const { Tts } = useTts()

  return (
    <View style={styles.container}>
      <ActivityIndicator style={styles.indicator} />
      <Tts text={t('connecting.title')} align='center' />
    </View>
  )
}
