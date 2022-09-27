import React from 'react'
import { Text } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'

const styles = createStyleSheet({
  default: {
    fontFamily: 'semicolon',
    fontSize: 18
  }
})

/**
 * LeaText is a component ... //TODO
 *
 * @category Components
 * @param {string} props.text: The displayed text
 * @param {StyleSheet} props.style: The style elements for the text
 * @returns {JSX.Element}
 * @constructor
 */
const LeaText = props => <Text style={{ ...styles.default, ...(props.style) }}>{props.children}</Text>

export default LeaText
