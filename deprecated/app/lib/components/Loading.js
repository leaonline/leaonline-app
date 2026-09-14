import React, { useCallback, useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useTts } from './Tts'
import { Colors } from '../constants/Colors'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'

/**
 * Renders a ActivityIndicator with an optional message.
 * @param text
 * @param color
 * @param style
 * @param timeOut
 * @return {Element}
 * @constructor
 */
export const Loading = ({ text, color, style, timeOut = 700 }) => {
  const [showText, setShowText] = useState(false)
  const { Tts } = useTts()
  const renderText = useCallback(() => {
    if (!text || !showText) return null
    return (
      <Tts text={text} />
    )
  }, [text, showText])

  useEffect(() => {
    let timer
    if (timeOut > 0) {
      timer = setTimeout(() => setShowText(true), timeOut)
    }
    else {
      setShowText(true)
    }
    // prevent memleak
    return () => clearTimeout(timer)
  }, [timeOut])

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
