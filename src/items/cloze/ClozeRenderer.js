import React, { useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import Colors from '../../constants/Colors'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { ClozeTokenizer } from './ClozeTokenizer'
import { ClozeHelpers } from './ClozeHelpers'
import { UndefinedScore } from '../../scoring/UndefinedScore'
import { ClozeRendererSelect } from './ClozeRendererSelect'
import { useTts } from '../../components/Tts'
import { CompareState } from '../utils/CompareState'
import { Log } from '../../infrastructure/Log'
import { LeaText } from '../../components/LeaText'
// import { getKeyboardType, KeyboardTypes } from '../utils/KeyboardTypes'
import { ClozeRendererBlank } from './ClozeRendererBlank'
import { Layout } from '../../constants/Layout'

const debug = Log.create('ClozeRenderer', 'debug', true)

export const ClozeRenderer = props => {
  const { dimensionColor, contentId, value } = props
  const [entered, setEntered] = useState({})
  const [compared, setCompared] = useState({})
  const { isTable /*, hasTableBorder = true, scoring */ } = value
  const { tokens, tokenIndexes } = tokenize({ contentId, value })

  // on contentId changed, do:
  //
  // 1. submit an initial response with full-empty data
  //    to indicate this item has "started"
  //
  // 2. clear all selections when the content id changes
  //    which happens, for example, if we move to the next page
  useEffect(() => {
    setEntered({})
    setCompared({})
    props.submitResponse({
      responses: tokenIndexes.map(() => UndefinedScore),
      data: props
    })
  }, [props.contentId])

  // on showCorrectResponse, do:
  // compare responses with the correct responses when
  // the parent decided to activate {showCorrectResponse}
  useEffect(() => {
    if (!props.showCorrectResponse) {
      return
    }

    const compareValues = {}

    props.scoreResult.forEach((entry, index) => {
      const answerValue = Array.isArray(entry.value)
        ? entry.value[0]
        : entry.value
      const compareValue = CompareState.getValue(entry.score, answerValue)
      compareValues[index] = {
        score: compareValue,
        expected: entry.correctResponse,
        actual: answerValue,
        color: CompareState.getColor(compareValue)
      }
    })

    debug({ compareValues })
    setCompared(compareValues)
  }, [props.showCorrectResponse])

  const submitText = ({ text, index }) => {
    const update = { ...entered }
    update[index] = text
    setEntered(update)
    return props.submitResponse({
      responses: tokenIndexes.map(index => index in update ? update[index] : UndefinedScore),
      data: props
    })
  }

  const renderTokenGroup = (tokenGroup, groupIndex) => {
    // TODO check if we need multiline in some units
    // const isMultiline = false // !valueToken.tts && valueToken.value.length === 1
    const compareValue = props.showCorrectResponse && compared[tokenGroup.itemIndex]
    const groupKey = `token-group-${groupIndex}`
    return (
      <View style={styles.tokenWrap} key={groupKey}>
        {tokenGroup.tts
          ? (<RenderTts text={tokenGroup.tts} color={dimensionColor} />)
          : null}
        {tokenGroup.value.map((token, index) => {
          const key = `token-group-${groupIndex}-token-${index}`
          const { flavor } = token

          // the indexes differ when using table layout vs
          // default sequencial layout, because in table layout
          // we habe a [rows[columns]] double array, which makes
          // use of index unavailable as they could be the same
          // values for every new row so we use the itemIndex
          // then
          const sourceIndex = isTable
            ? tokenGroup.itemIndex
            : tokenGroup.index

          if (ClozeHelpers.isBlank(flavor)) {
            const blankStyle = isTable
              ? { borderWidth: 0.5 }
              : null

            return (
              <ClozeRendererBlank
                key={key}
                compare={compareValue}
                color={dimensionColor}
                original={token.value}
                value={sourceIndex in entered ? entered[sourceIndex] : null}
                style={blankStyle}
                pattern={tokenGroup.pattern}
                onEndEditing={e => {
                  const { text } = e.nativeEvent
                  submitText({ text, index: sourceIndex })
                }}
              />
            )
          }

          if (ClozeHelpers.isEmpty(flavor)) {
            return (<LeaText key={key} style={styles.token}>EMPTY</LeaText>)
          }

          if (ClozeHelpers.isSelect(flavor)) {
            return (
              <ClozeRendererSelect
                key={key}
                color={dimensionColor}
                style={styles.token}
                value={sourceIndex in entered ? entered[sourceIndex] : null}
                compare={compareValue}
                options={token.value}
                onSelect={(option, index) => submitText({
                  text: index,
                  index: sourceIndex
                })}
              />
            )
          }

          if (ClozeHelpers.isText(flavor)) {
            return (<LeaText key={index} style={styles.token}>{token.value}</LeaText>)
          }

          if (token.value) {
            return (<LeaText key={index} style={styles.token}>{token.value}</LeaText>)
          }

          return null
        })}
      </View>
    )
  }

  const renderCell = (entry, rowIndex, colIndex) => {
    if (entry.isEmpty) {
      return null
    }
    else if (entry.isToken && Array.isArray(entry.value)) {
      return renderTokenGroup(entry, `${rowIndex}${colIndex}`)
    }
    else {
      return (
        <LeaText>{entry.value}</LeaText>
      )
    }
  }

  if (isTable) {
    return (
      <View style={styles.container}>
        {tokens.map((row, rowIndex) => {
          return (
            <View style={styles.row} key={`row-${rowIndex}`}>
              {row.map((entry, colIndex) => {
                return (
                  <View style={styles.cell} key={`row-${rowIndex}-col-${colIndex}`}>
                    {renderCell(entry, rowIndex, colIndex)}
                  </View>
                )
              })}
            </View>
          )
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
                {renderTokenGroup(entry, index)}
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

// ============================================================================
//
//  INTERNAL / PRIVATE
//
// ============================================================================

const RenderTts = ({ text, color }) => {
  if (!text?.length) {
    return null
  }

  const { Tts } = useTts()
  return (<Tts color={color} text={text} dontShowText />)
}

// TODO add cache-busting when contentId changes
const cache = new Map()
// const CELL_SKIP = '<<>>'

const tokenize = ({ contentId, value }) => {
  if (!cache.has(contentId)) {
    debug('tokenize', contentId, value)
    const tokens = createTokens(value)

    // to generate indexes we need to flatten
    // if we have table mode active, since tokens
    // were grouped into "rows" then for easy rendering
    const indexInput = value.isTable
      ? tokens.flat(1)
      : tokens
    const tokenIndexes = indexInput
      .filter(isInteractiveToken)
      .map(tkn => value.isTable ? tkn.itemIndex : tkn.index)
    debug('tokens', tokens)
    debug('indexs', tokenIndexes)
    cache.set(contentId, { tokens, tokenIndexes })
  }
  return cache.get(contentId)
}

const isInteractiveToken = tkn =>
  ClozeHelpers.isBlank(tkn.flavor) ||
  ClozeHelpers.isSelect(tkn.flavor) ||
  ClozeHelpers.isEmpty(tkn.flavor)

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
    }
    else {
      tokens.forEach(assignIndex)
    }

    return tokens
  }
  catch (e) {
    console.error(e)
    return []
  }
}

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
    ...Layout.defaultFont(),
    padding: 5,
    backgroundColor: '#fff',
    alignSelf: 'center'
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
  },
  table: {
    flex: 1,
    flexDirection: 'column'
  },
  row: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cell: {
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.light,
    flex: 1,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
}, true)
