import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

export const FadePanel = ({ children, visible, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    }
    else if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start()
    }
  }, [visible])

  return (
    <Animated.View
      style={{
        ...style,
        opacity: fadeAnim
      }}
    >
      {children}
    </Animated.View>
  )
}
