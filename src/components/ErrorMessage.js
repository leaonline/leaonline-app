import React from 'react'
import { TTSengine } from './Tts'
import { ActionButton } from './ActionButton'
import { View } from 'react-native'

const Tts = TTSengine.component()

export const ErrorMessage = ({ message, label, onConfirm }) => {
  return (
    <View>
      <Tts text={message} />
      <ActionButton text={label} onPress={onConfirm} />
    </View>
  )
}
