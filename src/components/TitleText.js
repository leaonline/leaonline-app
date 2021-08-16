import React from 'react'
import { Text, StyleSheet } from 'react-native'

/**
 * TitleText is a component of Tts. It displays the spoken text.
 * @param {string} props.text: The displayed text
 * @param {css} props.style: The style elements for the text
 * @returns {JSX.Element}
 * @constructor
 */
const TitleText = props => <Text style={{ ...styles.body, ...props.style }}>{props.text}</Text>

const styles = StyleSheet.create({
  body: {
    fontFamily: 'semicolon',
    fontSize: 18

  }
})

export default TitleText
