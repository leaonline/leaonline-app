import React from 'react'
import { getI18n } from 'react-i18next'
import { TTSengine } from './Tts'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import MarkdownRenderer from 'react-native-markdown-display'

const Tts = TTSengine.component()

const rules = {
  body (node, children, parent, thisStyles) {
    return (
      <View key={node.key} style={styles.container}>{children}</View>
    )
  },
  paragraph (node, children, parent, thisStyles) {
    if (children.length === 0) {
      return null
    }
    return (
      <View key={node.key} style={styles.paragraph}>{children}</View>
    )
  },
  textgroup (node, children, parent, thisStyles) {
    if (children.length === 0) {
      return null
    }
    return (
      <View key={node.key} style={styles.textGroup}>{children}</View>
    )
  },
  text: (node, children, parent, thisStyles) => {
    if (!node || !node.content) {
      return null
    }

    const text = node.content
    const transformed = text
      .replace(/§§/g, getI18n().t('legal.paragraphs'))
      .replace(/§/g, getI18n().t('legal.paragraph'))
      .replace(/<[^>*]*>/g, '')
    return (
      <Tts
        key={node.key}
        style={styles.text}
        text={text}
        block={true}
        ttsText={transformed}
        align='flex-start'  />
    )
  },
}

const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  paragraph: {
    flex: 1
  },
  textGroup: {
    flex: 1,
    marginBottom: 15
  },
  text: {
    flex: 1
  }
})

const MarkdownWithTTS = props => {
  return (<MarkdownRenderer style={props.style} rules={rules}>{props.value}</MarkdownRenderer>)
}

export const Markdown = React.memo(MarkdownWithTTS)
