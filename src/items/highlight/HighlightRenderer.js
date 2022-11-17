import React, { useEffect, useState } from 'react'
import { Text, View, TouchableHighlight } from 'react-native'
import { TTSengine } from '../../components/Tts'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { useTranslation } from 'react-i18next'
import { LeaText } from '../../components/LeaText'
import { CompareState } from '../utils/CompareState'

const pattern = /\w+|{{[^{]+}}|\S|\s{2,}/g
const separatorChars = /[.,;:?!]+/g
const groupPattern = /[{}]+/g
const whiteSpace = /^\s+$/

const Tts = TTSengine.component()
const tokenCache = new Map()



export const HighlightRenderer = props => {
  const { dimensionColor } = props
  const { t } = useTranslation()
  const [selected, setSelected] = useState({})
  const [compared, setCompared] = useState({})

  // When contentId changes we have a new element to be rendered:
  // 1. clear all selections when the content id changes
  // which happens, for example, if we move to the next page
  // 2. clear all compared
  // 3. submit a fresh "empty" response
  useEffect(() => {
    setSelected({})
    setCompared({})
    props.submitResponse({
      responses: getResponses({}),
      data: props
    })
  }, [props.contentId])

  // compare responses with the correct responses when
  // the parent decided to activate {showCorrectResponse}
  useEffect(() => {
    if (props.showCorrectResponse) {
      const correctResponses = props.value.scoring.flatMap(sc => sc.correctResponse)
      const result = {}

      // part 1 - check if all correct ones were selected
      correctResponses.forEach(index => {
        result[index] = selected[index] === true
          ? 1 // right
          : -1 // missing
      })

      // part 2 - check if others were selected that shouldn't be
      Object.entries(selected).forEach(([index, value]) => {
        if (value && result[index] === undefined) {
          result[index] = 0 // wrong
        }
      })

      setCompared(result)
    }
  }, [props.showCorrectResponse])

  // tokenize the text to processable elements
  const { contentId, value } = props
  const { text, tts } = value
  const { tokens, readableText } = tokenize({ contentId, text })

  if (!tokens) {
    console.warn('no tokens available')
    return null
  }

  // if a token is selected we toggle it's active state (Boolean)
  // and submit the overall responses immediately to the parent
  const selectToken = async index => {
    const update = { ...selected }
    update[index] = !update[index]
    setSelected(update)

    return props.submitResponse({
      responses: getResponses(update),
      data: props
    })
  }

  // the tokenized text can easily be iterated and each element
  // is rendered as a touchable element with a text inside
  // - selected elements are highlighted with background
  const renderTokens = () => {
    return tokens.map(({ value, isSeparator, isSpace }, index) => {
      if (isSpace) {
        return (<View key={index} style={styles.break} />)
      }

      const tokenStyle = { ...styles.token }

      if (selected[index]) {
        Object.assign(tokenStyle, {
          backgroundColor: dimensionColor || Colors.primary,
          color: Colors.light
        })
      }

      if (props.showCorrectResponse) {
        const backgroundColor = CompareState.getColor(compared[index])

        if (backgroundColor) {
          Object.assign(tokenStyle, { backgroundColor })
        }
      }

      // the onPress event should only be forwarded
      // if we are in edit mode.
      const onElementPress = async e => {
        if (props.showCorrectResponse) {
          return e.preventDefault()
        }

        return selectToken(index)
      }

      return (
        <TouchableHighlight onPress={onElementPress} key={index}>
          <LeaText style={tokenStyle}>{value}</LeaText>
        </TouchableHighlight>
      )
    })
  }

  const renderTts = () => tts
    ? (
      <View style={styles.ttsContainer}>
        <Tts color={dimensionColor} text={readableText} dontShowText />
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

const getResponses = (selection) => {
  const responses = []
  Object.keys(selection).forEach(index => {
    const value = selection[index]
    if (value) {
      responses.push(index)
    }
  })

  if (responses.length === 0) {
    responses.push('__undefined__')
  }

  return responses
}

const styles = createStyleSheet({
  container: {
    marginLeft: 5,
    marginRight: 5
  },
  ttsContainer: {
    alignContent: 'center'
  },
  comparecontainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  tokenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  token: {
    padding: 5,
    paddingRight: 2,
    color: Colors.dark,
    backgroundColor: '#fff'
  },
  selected: {
    backgroundColor: Colors.primary,
    color: Colors.light
  },
  break: {
    alignSelf: 'stretch',
    width: '100%'
  },
  right: {
    backgroundColor: Colors.success,
    color: Colors.light
  },
  wrong: {
    backgroundColor: Colors.danger,
    color: Colors.light
  },
  missing: {
    backgroundColor: Colors.warning,
    color: Colors.light
  }
})