import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useTts } from './Tts'
import { Colors } from '../constants/Colors'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'

export const Loading = ({ text, color, style }) => {
  const { Tts } = useTts()
  const renderText = () => {
    if (!text) return null

    return (
      <Tts text={text} />
    )
  }

  const containerStyle = style
    ? mergeStyles(styles.container, style)
    : styles.container

  return (
    <View style={containerStyle}>
      <ActivityIndicator size='large' color={color ?? Colors.secondary} />
      {renderText()}
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
