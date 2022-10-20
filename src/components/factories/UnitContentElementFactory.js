import React from 'react'
import { View } from 'react-native'
import { Log } from '../../infrastructure/Log'
import { LeaText } from '../LeaText'

export const UnitContentElementFactory = {}

const components = new Map()
const toKey = ({ type, subtype }) => `${type}-${subtype}`
/**
 * Registers a content element renderer to be invoked by the factory
 * @param type
 * @param subtype
 * @param component
 */
UnitContentElementFactory.register = ({ type, subtype, component }) => {
  const key = toKey({ type, subtype })
  components.set(key, component)
}

/**
 * Invokes a renderer by given type/subtype
 * @param props
 * @return {*}
 * @constructor
 */
UnitContentElementFactory.Renderer = props => {
  const key = toKey(props)
  const component = components.get(key)
  Log.debug('[UnitContentElementFactory]: render', key, !!component)

  if (component) {
    return component(props)
  }

  return fallback(props)
}

const fallback = props => (
  <View key={props.key}>
    <LeaText>Fallback: {props.type} / {props.subtype}</LeaText>
  </View>
)
