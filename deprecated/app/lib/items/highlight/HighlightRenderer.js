import React, { useEffect, useMemo, useState } from 'react'
import { View, Pressable } from 'react-native'
import { useTts } from '../../components/Tts'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Colors } from '../../constants/Colors'
import { LeaText } from '../../components/LeaText'
import { CompareState } from '../utils/CompareState'
import { HighlightTokenizer } from './HighlightTokenizer'
import { getCompareValuesForSelectableItems } from '../shared/getCompareValuesForSelectableItems'

export const HighlightRenderer = props => {
  const { dimensionColor } = props
  const { Tts } = useTts()
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
      const result = getCompareValuesForSelectableItems({ correctResponses, selected })

      setCompared(result)
    }
  }, [props.showCorrectResponse])

  // tokenize the text to processable elements
  const { value } = props
  const { text, tts } = value
  const { tokens, readableText } = useMemo(() => {
    return HighlightTokenizer.tokenize({ text })
  }, [props.contentId])

  if (!tokens?.length) {
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
        <Pressable accessibilityRole='button' onPress={onElementPress} key={index}>
          <LeaText style={tokenStyle}>{value}</LeaText>
        </Pressable>
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
    <View style={[styles.container, props.style]}>
      {renderTts()}
      <View style={styles.tokenContainer}>
        {renderTokens()}
      </View>
    </View>
  )
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
