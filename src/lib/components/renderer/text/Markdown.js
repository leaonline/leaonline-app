import React from 'react'
import { View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'

/**
 * Renders markdown in units
 * @param props {object}
 * @param props.value {string} the markdown text
 * @param props.style {object=} optional styles
 * @return {JSX.Element}
 * @constructor
 */
export const MarkdownRenderer = props => {
  return (
    <View style={[styles.container, props.style]}>
      <Markdown style={styles.text}>{props.value}</Markdown>
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container()
  },
  text: {
    body: {
      ...Layout.defaultFont()
    }
  }
})
