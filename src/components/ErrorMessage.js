import React from 'react'
import { TTSengine } from './Tts'
import { ActionButton } from './ActionButton'
import { View } from 'react-native'

const Tts = TTSengine.component()

export const ErrorMessage = ({ error, message, label, onConfirm }) => {
  return (
    <View>
      <Tts text={message || error.message} />
      <ActionButton text={label} onPress={onConfirm} />
    </View>
  )
}
