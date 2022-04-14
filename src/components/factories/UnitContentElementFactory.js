import React from 'react'
import { Text, View } from 'react-native'

export const UnitContentElementFactory = {}

const components = new Map()

UnitContentElementFactory.register = ({ type, subtype, component }) => {
  const key = `${type}-${subtype}`
  components.set(key, component)
}

UnitContentElementFactory.Renderer = props => {
  const { type, subtype } = props
  const key = `${type}-${subtype}`
  const component = components.get(key)

  return component
    ? component(props)
    : fallback(props)
}

const fallback = props => (
  <View key={props.key}>
    <Text>Fallback: {props.type} / {props.subtype}</Text>
  </View>
)
