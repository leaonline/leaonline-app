import React from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'

export const ViewContainer = ({ style, children, ...props }) => {
  const containerStyles = styles.container
  if (style) {
    Object.assign(containerStyles, style)
  }

  return (<View style={containerStyles} {...props}>{children}</View>)
}

const styles = createStyleSheet({
  container: Layout.container()
})
