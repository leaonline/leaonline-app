import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { TTSengine } from './Tts'
import Colors from '../constants/Colors'

const Tts = TTSengine.component()

export const Loading = ({ text  }) => {
  const renderText = () => {
    if (!text) return null

    return (
      <Tts text={text}  />
    )
  }
  return (
    <View>
      <ActivityIndicator size='large' color={Colors.secondary} />
      {
        renderText()
      }
    </View>
  )
}
