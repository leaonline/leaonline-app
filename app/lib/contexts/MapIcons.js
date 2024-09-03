import React from 'react'
import { Colors } from '../constants/Colors'
import { createContextStorage } from './createContextStorage'
import Icon from '@expo/vector-icons/FontAwesome6'
import { collectionNotInitialized } from './collectionNotInitialized'

export const MapIcons = {
  name: 'mapIcons'
}

MapIcons.collection = collectionNotInitialized(MapIcons)

MapIcons.storage = createContextStorage(MapIcons)

MapIcons.init = async () => {
  return MapIcons.storage.loadIntoCollection()
}

MapIcons.setField = fieldId => {
  const currentIcons = MapIcons.collection().findOne({ fieldId })
  internal.icons = currentIcons?.icons ?? []
  internal.count = 0
}

const internal = {
  icons: [],
  count: 0
}

MapIcons.size = () => internal.icons.length

MapIcons.getIncrementalIconIndex = () => {
  if (internal.icons.length === 0) {
    return -1
  }

  if (internal.count > internal.icons.length - 1) {
    internal.count = 0
  }

  return internal.count++
}

MapIcons.render = (index) => {
  if (index > internal.icons.length - 1 || index < 0) {
    return null
  }

  const name = internal.icons[index]
  return (
    <Icon
      color={Colors.gray}
      size={50}
      name={name}
      reverse={false}
    />
  )
}
