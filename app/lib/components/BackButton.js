import React, { useCallback } from 'react'
import { Pressable, Vibration } from 'react-native'
import Icon from '@expo/vector-icons/FontAwesome6'
import { Colors } from '../constants/Colors'
import { useNavigation } from '@react-navigation/native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'

export const BackButton = (props) => {
  const { goBack } = useNavigation()
  const handleOnPress = useCallback(async () => {
    if (props.vibrate !== false) {
      Vibration.vibrate(100)
    }
    if (props.onPress) {
      await props.onPress()
    }
    return goBack()
  }, [goBack, props.onPress, props.vibrate])

  const containerStyle = mergeStyles(styles.buttonContainer, props.style)

  return (
    <Pressable
      accessibilityRole='button'
      style={containerStyle}
      onPress={handleOnPress}
      hitSlop={10}
      android_ripple={rippleConfig}
    >
      <Icon name={props.icon}  color={Colors.secondary} size={18} />
    </Pressable>
  )
}

const styles = createStyleSheet({
  buttonContainer: {
    borderWidth: 0,
    padding: 10,
    overflow: 'hidden'
  }
})

const rippleConfig = {
  color: Colors.secondary,
  borderless: true,
  radius: 20
}
