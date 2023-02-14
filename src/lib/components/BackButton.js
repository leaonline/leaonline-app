import React from 'react'
import { Pressable, Vibration } from 'react-native'
import { Icon } from 'react-native-elements'
import { Colors } from '../constants/Colors'
import { useNavigation } from '@react-navigation/native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'

export const BackButton = (props) => {
  const navigation = useNavigation()
  const handleOnPress = async () => {
    if (props.vibrate !== false) {
      Vibration.vibrate(100)
    }
    if (props.onPress) {
      await props.onPress()
    }
    return navigation.goBack()
  }

  const containerStyle = mergeStyles(styles.buttonContainer, props.style)

  return (
    <Pressable style={containerStyle} onPress={handleOnPress} hitSlop={10} android_ripple={rippleConfig}>
      <Icon
        name={props.icon} type='font-awesome-5' color={Colors.secondary} size={18}
      />
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
