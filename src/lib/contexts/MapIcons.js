import React from 'react'
import { Colors } from '../constants/Colors'
import { createContextStorage } from './createContextStorage'

export const MapIcons = {
  name: 'mapIcons'
}

MapIcons.collection = () => {
  throw new Error('MapIcons is not intialized')
}

MapIcons.storage = createContextStorage(MapIcons)

MapIcons.init = async () => {
  return MapIcons.storage.loadIntoCollection()
}

const icons = []

MapIcons.size = () => icons.length

MapIcons.register = component => {
  icons.push(component)
}

let count = 0

MapIcons.getIncrementalIconIndex = () => {
  if (icons.length === 0) {
    return -1
  }

  if (count > icons.length - 1) {
    count = 0
  }

  return count++
}

MapIcons.render = (index) => {
  if (index > icons.length - 1 || index < 0) {
    return null
  }

  const Component = icons[index]
  return (
    <Component
      stroke={Colors.gray}
      fill={Colors.light}
      width={60}
      height={60}
    />
  )
}
