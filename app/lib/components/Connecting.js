import React, { useState } from 'react'
import { Modal, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { useTranslation } from 'react-i18next'
import { useTts } from './Tts'
import { makeTransparent } from '../styles/makeTransparent'
import { Colors } from '../constants/Colors'
import Icon from '@expo/vector-icons/FontAwesome'
import { useDevelopment } from '../hooks/useDevelopment'

const iconSize = 46
const minusSize = 20

/**
 * Default visual for indicating to users, that we are connecting to the servers.
 * @returns {JSX.Element}
 * @component
 */
export const Connecting = ({ connection }) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(true)
  const dev = useDevelopment()
  const reachBackend = connection.www && connection.backend
  let description

  if (reachBackend) {
    description = t('connecting.done')
  }
  else if (connection.www) {
    description = t('connecting.backend')
  }
  else {
    description = t('connecting.www')
  }

  const close = () => {
    if (!dev.isDeveloperRelease && !dev.isDevelopment) {
      return
    }
    setVisible(!visible)
  }

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={styles.background}>
        <View style={styles.content}>
          <View style={styles.container}>
            <View style={styles.row}>
              <Icon name='mobile' size={iconSize} color={Colors.success} />
              <Connection connected={connection.www} available />
              <Icon name='wifi' size={iconSize} color={connection.www ? Colors.success : Colors.danger} />
              <Connection connected={reachBackend} available={connection.www} />
              <Icon name='cloud' size={iconSize} color={reachBackend ? Colors.success : Colors.danger} />
            </View>
            <Description text={description} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const Description = ({ text }) => {
  const { Tts } = useTts()
  return (<Tts text={text} />)
}

const Connection = ({ connected }) => {
  const arrowColor = connected ? Colors.success : Colors.danger

  return (
    <View style={styles.row}>
      <Icon name='minus' size={minusSize} color={arrowColor} />
    </View>
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
  row: {
    ...Layout.row(),
    padding: 2
  },
  indicator: {
    height: 50
  }
})
