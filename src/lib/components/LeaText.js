import React from 'react'
import { Text } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'
import { Layout } from '../constants/Layout'

/**
 * LeaText is a component ... // TODO
 *
 * @category Components
 * @param {string} props.text: The displayed text
 * @param {StyleSheet} props.style: The style elements for the text
 * @param {boolean=} props.autoScale set to false to disable `adjustsFontSizeToFit`, defaults to true
 * @param {boolean=} props.fitSize set font to fit parent element
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
      adjustsFontSizeToFit={props.fitSize}
      allowFontScaling={props.autoScale}
      style={style}
    >
      {props.children}
    </Text>
  )
}

const styles = createStyleSheet({
  default: Layout.defaultFont()
})
