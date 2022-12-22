import React from 'react'
import { Vibration, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { useNavigation } from '@react-navigation/native'

export const ProfileButton = props => {
  const navigation = useNavigation()
  const toProfile = () => {
    if (props.vibrate !== false) {
      Vibration.vibrate(100)
    }
    navigation.navigate(props.route)
  }
  return (
    <View style={{ display: 'flex', marginLeft: 'auto' }}>
      <Icon
        name='user' type='font-awesome-5' color={Colors.gray} reverse
        style size={18}
        onPress={toProfile}
      />
    </View>
  )
}
