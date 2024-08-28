import React, { useRef, useEffect } from 'react'
import { Path } from 'react-native-svg'
import { Animated, Easing } from 'react-native'

const AnimatedPath = Animated.createAnimatedComponent(Path)

export const DashedLine = props => {
  const offset = useRef(new Animated.Value(props.invert ? 100 : 0)).current

  useEffect(() => {
    Animated.loop(
    Animated.timing(offset, {
      toValue: props.invert ? 0 : 100,
      duration: 5000,
      useNativeDriver: true,
      isInteraction: false,
      easing: Easing.linear
    })).start()
  }, [offset]);

  return (
    <AnimatedPath
      strokeWidth={props.width}
      stroke={props.color}
      strokeOpacity={props.opacity}
      strokeDasharray={[10, 10]}
      strokeDashoffset={offset}
      d={props.path}
    />
  )
}
