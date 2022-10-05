import React, { useState, useEffect } from 'react'
import { Text, View, TextInput } from 'react-native'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { ClozeTokenizer } from './ClozeTokenizer'
import { ClozeHelpers } from './ClozeHelpers'
import { UndefinedScore } from '../../scoring/UndefinedScore'
import { Select } from '../../components/Select'
import { TTSengine } from '../../components/Tts'
import { CompareState } from '../utils/CompareState'

const Tts = TTSengine.component()

const styles = createStyleSheet({
  container: {
    flex: 1
  },
  ttsContainer: {
    width: '100%',
    alignContent: 'center'
  },
  comparecontainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  tokenContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tokenWrap: {
    flexDirection: 'row'
  },
  select: {
    backgroundColor: '#f0a'
  },
  selectItem: {
    padding: 5,
    fontSize: 18,
    fontFamily: 'semicolon',
    color: Colors.dark,
    backgroundColor: '#fff'
  },
  token: {
    padding: 5,
    fontSize: 18,
    fontFamily: 'semicolon',
    color: Colors.dark,
    backgroundColor: '#fff',
    alignSelf: 'center'
  },
  input: {
    padding: 5,
    fontSize: 18,
    fontFamily: 'semicolon',
    color: Colors.dark,
    backgroundColor: '#fff',
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4
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

export const ClozeRenderer = props => {
  const { dimensionColor, contentId, value } = props
  const [entered, setEntered] = useState({})
  const [compared, setCompared] = useState({})
  // const { isTable, hasTableBorder = true, scoring } = value
  const { tokens, tokenIndexes } = tokenize({ contentId, value })

  // on contentId changed
  // 1. submit an initial response with full-empty data
  //
  // 2. clear all selections when the content id changes
  // which happens, for example, if we move to the next page
  useEffect(() => {
    setEntered({})
    setCompared({})
    props.submitResponse({
      responses: tokenIndexes.map(() => UndefinedScore),
      data: props
    })
  }, [props.contentId])

  // compare responses with the correct responses when
  // the parent decided to activate {showCorrectResponse}
  useEffect(() => {
    if (props.showCorrectResponse) {
      const result = {}
      const targets = {}

      // get all target indexes
      props.value.scoring.forEach(entry => {
        targets[entry.correctResponse] = entry.target
      })

      props.scoreResult.forEach(entry => {
        const index = targets[entry.correctResponse]

        if (result[index] !== 1) {
          const answerValue = Array.isArray(entry.value)
            ? entry.value[0]
            : entry.value
          result[index] = CompareState.getValue(entry.score, answerValue)
        }
      })

      setCompared(result)
    }
  }, [props.showCorrectResponse])

  const renderTts = text => {
    if (!text?.length) { return null }
    return (<Tts color={dimensionColor} text={text} dontShowText />)
  }
  const submitText = ({ text, index }) => {
    const update = { ...entered }
    update[index] = text
    setEntered(update)
    return props.submitResponse({
      responses: tokenIndexes.map(index => index in update ? update[index] : UndefinedScore),
      data: props
    })
  }

  const renderTokenList = (valueToken) => {
    // TODO check if we need multiline in some units
    const isMultiline = false // !valueToken.tts && valueToken.value.length === 1

    return (
      <View style={styles.tokenWrap}>
        {renderTts(valueToken.tts)}
        {valueToken.value.map((token, index) => {
          const { flavor } = token
          const isBlank = ClozeHelpers.isBlank(flavor)

          if (isBlank) {
            const compareValue = compared[valueToken.itemIndex]
            const compareColor = CompareState.getColor(compareValue)
            const inputStyle = { ...styles.input }

            if (compareColor) {
              inputStyle.backgroundColor = compareColor
              inputStyle.borderColor = compareColor
            } else {
              inputStyle.borderColor = dimensionColor
            }

            const editable = !props.showCorrectResponse
            const maxLength = Math.floor(token.length * 1.5)
            // TODO integrate custom keyboard for pattern-based input filter
            // https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/nativeComponentScreens/keyboardInput/demoKeyboards.js
            return (
              <TextInput
                key={index}
                editable={editable}
                placeholderTextColor={dimensionColor}
                selectionColor={dimensionColor}
                value={valueToken.index in entered ? entered[valueToken.index] : null}
                // prevent various type assistance functionalities
                autoCorrect={false}
                autoCapitalize='none'
                contextMenuHidden
                importantForAutofill='no' // android
                textContentType='none' // ios
                spellCheck={false}
                // appearance
                maxLength={maxLength}
                multiline={isMultiline}
                blurOnSubmit
                style={inputStyle}
                // selectionColor
                // keyboard
                returnKeyType='done'
                keyboardType='visible-password'
                onEndEditing={e => {
                  const { text } = e.nativeEvent
                  submitText({ text, index: valueToken.index })
                }}
              />
            )
          }

          if (ClozeHelpers.isEmpty(flavor)) {
            return (<Text key={index} style={styles.token}>EMPTY</Text>)
          }

          if (ClozeHelpers.isSelect(flavor)) {
            return (
              <Select
                key={index}
                color={dimensionColor}
                style={styles.token}
                value={valueToken.index in entered ? entered[valueToken.index] : null}
                options={token.value}
                onSelect={(option, index) => submitText({
                  text: index,
                  index: valueToken.index
                })}
              />
            )
          }

          if (ClozeHelpers.isText(flavor)) {
            return (<Text key={index} style={styles.token}>{token.value}</Text>)
          }

          if (token.value) {
            return (<Text key={index} style={styles.token}>{token.value}</Text>)
          }

          return null
        })}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tokenContainer}>
        {tokens.map((entry, index) => {
          if (entry.isEmpty) { return null }

          // newlines can be used to explicitly break
          // using a fully stretched flex box
          if (entry.isNewLine) {
            return (<View key={index} style={styles.break} />)
          }

          // token can be blanks, selects, empties and text
          // that is associated with other token, forming a group
          if (entry.isToken) {
            return (
              <View key={index} style={styles.token}>
                {renderTokenList(entry, index)}
              </View>
            )
          }

          // plain text that is not associated to any token
          if (entry.value) {
            return (<Text key={index} style={styles.token}>{entry.value}</Text>)
          }

          // no value should cause no render
          return null
        })}
      </View>
    </View>
  )
}

// TODO add cache-busting when contentId changes
const cache = new Map()
// const CELL_SKIP = '<<>>'

const tokenize = ({ contentId, value }) => {
  if (!cache.has(contentId)) {
    const tokens = createTokens(value)
    const tokenIndexes = tokens
      .filter(t =>
        ClozeHelpers.isBlank(t.flavor) ||
        ClozeHelpers.isSelect(t.flavor) ||
        ClozeHelpers.isEmpty(t.flavor))
      .map(t => t.index)
    cache.set(contentId, { tokens, tokenIndexes })
  }
  return cache.get(contentId)
}

const createTokens = (value) => {
  try {
    const tokens = ClozeTokenizer.tokenize(value)
    let index = 0

    const assignIndex = token => {
      if (Object.hasOwnProperty.call(token, 'flavor')) {
        token.itemIndex = index++
      }
    }

    if (value.isTable) {
      tokens.forEach(row => row.forEach(assignIndex))
    } else {
      tokens.forEach(assignIndex)
    }

    return tokens
  } catch (e) {
    console.error(e)
    return []
  }
}
