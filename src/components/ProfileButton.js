import React from 'react'
import { View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'

export const ProfileButton = props => {
  return (
    <View style={{ display: 'flex', marginLeft: 'auto'}}>
      <Icon name='user' type='font-awesome-5' color={Colors.gray} reverse
            style size={18}
            onPress={props.onPress}/>
    </View>
  )
}
