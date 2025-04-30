import React from 'react'
import { Pressable } from 'react-native'
import Icon from '@expo/vector-icons/FontAwesome6'
import { Colors } from '../constants/Colors'
import { Config } from '../env/Config'
import { NullComponent } from '../components/NullComponent'
import { createRoutableComponent } from '../components/factories/createRoutableComponent'

export const createDevelopmentButton = ({ route, icon }) => {
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
    <Pressable accessibilityRole='button' android_ripple={rippleConfig} onPress={props.onPress} style={props.style}>
      <Icon
        name={icon}
        color={Colors.gray}
        reverse
        size={18}
      />
    </Pressable>
  )

  return createRoutableComponent({ route, Component })
}
