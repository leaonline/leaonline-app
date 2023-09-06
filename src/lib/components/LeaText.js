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
  const {
    color,
    children,
    style,
    token,
    fitSize = false,
    hyphen = 'full',
    autoScale = false,
    ...rest
  } = props



  const mergedStyle = mergeStyles(styles.default, color ? { color } : undefined, style)
  return (
    <Text
      accessibilityRole='text'
      textBreakStrategy='highQuality'
      android_hyphenationFrequency={hyphen}
      adjustsFontSizeToFit={fitSize}
      allowFontScaling={autoScale}
      style={mergedStyle}
      {...rest}
    >
      {token
        ? token.map(token => (<Text key={token.key} accessibilityRole='text'
                                    textBreakStrategy='highQuality'
                                    android_hyphenationFrequency={hyphen}
                                    adjustsFontSizeToFit={fitSize}
                                    allowFontScaling={autoScale} style={token.style}>{token.text}</Text>))
        : children}
    </Text>
  )
}

const styles = createStyleSheet({
  default: Layout.defaultFont()
})
