import React from 'react'
import { View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'

/**
 * Renders markdown
 * @param props {object}
 * @param props.value {string} the markdown text
 * @return {JSX.Element}
 * @constructor
 */
export const MarkdownRenderer = props => {
  return (
    <View style={styles.container}>
      <Markdown style={styles.text}>{props.value}</Markdown>
    </View>
  )
}

const styles = createStyleSheet( {
  container: {
    ...Layout.container()
  },
  text: {
    body: {
      ...Layout.defaultFont()
    }
  }
})