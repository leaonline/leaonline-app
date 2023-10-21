import React from 'react'
import { ActivityIndicator, Modal, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { useTranslation } from 'react-i18next'
import { useTts } from './Tts'
import { makeTransparent } from '../styles/makeTransparent'
import { Colors } from '../constants/Colors'

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
      transparent={true}
      visible={true}
    >
      <View style={styles.background}>
        <View style={styles.content}>
          <View style={styles.container}>
            <ActivityIndicator style={styles.indicator} color={Colors.primary} size='large' />
            <Tts text={t('connecting.title')} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyleSheet({
  background: {
    flexGrow: 1,
    backgroundColor: makeTransparent(Colors.dark, 0.4)
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    ...Layout.dropShadow({ elevation: 6 })
  },
  indicator: {
    height: 50
  }
})
