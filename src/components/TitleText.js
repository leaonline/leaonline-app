import React from 'react'
import { Text } from 'react-native'

/**
 * TitleText is a component of Tts. It displays the spoken text.
 *
 * @category Components
 * @param {string} props.text: The displayed text
 * @param {StyleSheet} props.style: The style elements for the text
 * @returns {JSX.Element}
 * @constructor
 */
const TitleText = props => <Text style={props.style}>{props.text}</Text>

export default TitleText
