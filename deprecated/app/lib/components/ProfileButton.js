import React from 'react'
import { Pressable, Vibration } from 'react-native'
import Icon from '@expo/vector-icons/FontAwesome6'
import { Colors } from '../constants/Colors'
import { useNavigation } from '@react-navigation/native'
import nextFrame from 'next-frame'

export const ProfileButton = props => {
  const navigation = useNavigation()
  const toProfile = async () => {
    await nextFrame()
    if (props.vibrate !== false) {
      Vibration.vibrate(100)
    }
    navigation.navigate(props.route)
  }
  return (
    <Pressable accessibilityRole='button' android_ripple={rippleConfig} onPress={toProfile} style={{ display: 'flex', marginLeft: 'auto' }}>
      <Icon
        name='user' color={Colors.gray} reverse
        style size={18}
      />
    </Pressable>
  )
}

const rippleConfig = {
  color: Colors.dark,
  foreground: true,
  borderless: true,
  radius: 20
}
