import React from 'react'
import { Text } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'

export const Fill = () => {
  return (<Text style={styles.fill}></Text>)
}

const styles = createStyleSheet({
  fill: {
    flex: 1
  }
})
