import React from 'react'
import { Pressable, Vibration, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
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
    <Pressable android_ripple={rippleConfig}  onPress={toProfile} style={{ display: 'flex', marginLeft: 'auto' }}>
      <Icon
        name='user' type='font-awesome-5' color={Colors.gray} reverse
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