import React from 'react'
import { ActivityIndicator, Modal, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { useTranslation } from 'react-i18next'
import { useTts } from './Tts'

/**
 * Default visual for indicating to users, that we are connecting to the servers.
 * @returns {JSX.Element}
 * @component
 */
export const Connecting = () => {
  const { t } = useTranslation()
  const { Tts } = useTts()

  return (
    <Modal
      animationType='slide'
      transparent={false}
      visible
    >
      <View style={styles.background}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator style={styles.indicator} size='large' />
            <Tts text={t('connecting.title')} align='center' />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    justifyContent: 'center'
  },
  indicator: {
    height: 50
  }
})
