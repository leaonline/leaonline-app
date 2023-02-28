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
  const { color, children, style, fitSize, autoScale, ...rest } = props
  const mergedStyle = mergeStyles(styles.default, style, color ? { color } : undefined)
  return (
    <Text
      accessibilityRole='text'
      textBreakStrategy='highQuality'
      android_hyphenationFrequency='full'
      adjustsFontSizeToFit={fitSize}
      allowFontScaling={autoScale}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Text>
  )
}

const styles = createStyleSheet({
  default: Layout.defaultFont()
})
