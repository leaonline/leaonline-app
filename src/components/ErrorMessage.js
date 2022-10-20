import React from 'react'
import { TTSengine } from './Tts'
import { ActionButton } from './ActionButton'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'
import { Layout } from '../constants/Layout'

const Tts = TTSengine.component()

export const ErrorMessage = ({ error, message, label, onConfirm }) => {
  if (!error && !message) {
    return null
  }

  const renderConfirm = () => {
    if (!onConfirm) { return null }
    return (
      <ActionButton text={label} onPress={onConfirm} />
    )
  }
  return (
    <View style={styles.default}>
      <Tts iconColor={Colors.danger} color={Colors.danger} text={message || error.message} />
      {renderConfirm()}
    </View>
  )
}

const styles = createStyleSheet({
  default: {
    borderWidth: 0.5,
    padding: 10,
    borderColor: Colors.danger,
    backgroundColor: Colors.white,
    ...Layout.dropShadow()
  }
})
