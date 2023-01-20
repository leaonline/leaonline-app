import React from 'react'
import { Pressable } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { Config } from '../env/Config'
import { NullComponent } from '../components/NullComponent'
import { createRoutableComponent } from '../components/factories/createRoutableComponent'

export const createDevelopmentButton = ({ route }) => {
  if (!Config.isDeveloperRelease()) {
    return NullComponent
  }

  const rippleConfig = {
    color: Colors.dark,
    foreground: true,
    borderless: true,
    radius: 20
  }

  const Component = props => (
    <Pressable android_ripple={rippleConfig} onPress={props.onPress} style={props.style}>
      <Icon
        name='keyboard'
        type='font-awesome-5'
        color={Colors.gray}
        reverse={true}
        size={18}
      />
    </Pressable>
  )

  return createRoutableComponent({ route, Component })
}
