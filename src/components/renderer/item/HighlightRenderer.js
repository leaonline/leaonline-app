import React, { useEffect, useState } from 'react'
import { Text, View, TouchableHighlight } from 'react-native'
import { TTSengine } from '../../Tts'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import Colors from '../../../constants/Colors'
const pattern = /\w+|{{[^{]+}}|\S|\s{2,}/g
const separatorChars = /[.,;:?!]+/g
const groupPattern = /[{}]+/g
const whiteSpace = /^\s+$/

const Tts = TTSengine.component()
const tokenCache = new  Map()

const styles = createStyleSheet({
  container: {
    width: '100%',
  },
  ttsContainer: {
    width: '100%',
    alignContent: 'center'
  },
  tokenContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: "wrap"
  },
  token: {
    padding: 5,
    fontSize: 18,
    fontFamily: 'semicolon',
    color: Colors.dark
  },
  selected: {
    backgroundColor: Colors.primary,
    color: Colors.light
  },
  break: {
    alignSelf: 'stretch',
    width: '100%'
  }
})

const tokenize = ({ contentId, text }) => {
  if (tokenCache.has(contentId)) {
    return tokenCache.get(contentId)
  }

  if (!text) return []

  const matches = text.match(pattern)
  const tokens = matches
    .map(token => token.replace(groupPattern, ''))
    .map(token => {
      const obj = { value: token }

      if (whiteSpace.test(token)) {
        obj.isSpace = true
      }

      if (separatorChars.test(token)) {
        obj.isSeparator = true
      }

      return obj
    })

  const readableText = tokens.map(({ value }) => value).join(' ')

  tokenCache.set(contentId, { tokens, readableText })
  return { tokens, readableText }
}


export const HighlightRenderer = props => {
  const [selected, setSelected] = useState({})

  useEffect(() => {
    setSelected({})
  }, [props.contentId])

  const { contentId, value } = props
  const { text, tts } = value
  const { tokens, readableText } = tokenize({ contentId, text })

  const selectToken = index => {
    const update = { ...selected }
    update[index] = !update[index]
    setSelected(update)
  }

  const renderTokens = () => {
    return tokens.map(({ value, isSeparator, isSpace }, index) => {
      if (isSpace) {
        return (<View key={index} style={styles.break} />)
      }

      const tokenStyle = { ...styles.token }

      if (selected[index]) {
        Object.assign(tokenStyle, styles.selected)
      }

      return (
        <TouchableHighlight onPress={() => selectToken(index)} key={index}>
          <Text style={tokenStyle}>{value}</Text>
        </TouchableHighlight>
      )
    })
  }

  const renderTts = () => tts
    ? (
      <View style={styles.ttsContainer}>
        <Tts text={readableText} dontShowText />
      </View>
    )
    : null

  return (
    <View style={styles.container}>
      {renderTts()}
      <View style={styles.tokenContainer}>
        {renderTokens()}
      </View>
    </View>
  )
}