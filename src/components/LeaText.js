import React from 'react'
import { Text } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'
import { Layout } from '../constants/Layout'

/**
 * LeaText is a component ... //TODO
 *
 * @category Components
 * @param {string} props.text: The displayed text
 * @param {StyleSheet} props.style: The style elements for the text
 * @returns {JSX.Element}
 * @component
 */
export const LeaText = props => {
  const { color } = props
  const style = mergeStyles(styles.default, props.style, color ? { color } : undefined)
  return (
    <Text
      textBreakStrategy='highQuality'
      android_hyphenationFrequency='full'
      style={style}
    >
      {props.children}
    </Text>
  )
}

const styles = createStyleSheet({
  default: Layout.defaultFont()
})
