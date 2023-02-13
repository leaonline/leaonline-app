import React, { useCallback, useEffect, useRef } from 'react'
import { Animated } from 'react-native'

/**
 * An animated view that fades in and out.
 * If an `onComplete` callback is passed it will
 * trigger, once the animation is complete and pass the `id` and `visible` value.
 *
 * @param children {[JSX.Element]}
 * @param id {string}
 * @param visible {boolean}
 * @param style {object=}
 * @param onComplete {function=}
 * @return {JSX.Element}
 * @component
 */
export const FadePanel = ({ id, children, visible, style, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const completeCallback = useCallback(() => {
    if (onComplete) {
      onComplete({ id, visible })
    }
  }, [onComplete])
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start(completeCallback)
    }
    else if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start(completeCallback)
    }
  }, [visible])

  return (
    <Animated.View style={{ ...style, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  )
}
