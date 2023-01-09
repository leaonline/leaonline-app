import React, { useState, useEffect, useMemo } from 'react'
import { View } from 'react-native'
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
import { ClozeRendererBlank } from './ClozeRendererBlank'
import { Layout } from '../../constants/Layout'
import { isDefined } from '../../utils/isDefined'
import { mergeStyles } from '../../styles/mergeStyles'

const debug = Log.create('ClozeRenderer', 'debug', true)

export const ClozeRenderer = props => {
  const { dimensionColor, contentId, value } = props
  const [entered, setEntered] = useState({})
  const [compared, setCompared] = useState({})
  const { isTable, hasTableBorder, /* scoring */ } = value

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

  const { tokens, tokenIndexes } = useMemo(() => {
    return ClozeTokenizer.tokenize(props.value)
  }, [props.contentId])

  const submitText = ({ text, index }) => {
    const update = { ...entered }
    update[index] = text
    setEntered(update)

    return props.submitResponse({
      responses: tokenIndexes.map(index => index in update ? update[index] : UndefinedScore),
      data: props
    })
  }

  const renderText = (token, index) => {
    return token.value.split(/\s+/).map((word, wordIndex) => {
      const key = `word-${index}-${wordIndex}`
      return (<LeaText key={key} style={styles.word}>{word}</LeaText>)
    })
  }

  const renderTokenGroup = (tokenGroup, groupIndex) => {
    const groupKey = `token-group-${groupIndex}`
    const renderTTS = () => tokenGroup.tts
      ? (<RenderTts text={tokenGroup.tts} color={dimensionColor} />)
      : null

    return (
      <View style={styles.tokenWrap} key={groupKey}>
        {renderTTS()}
        {tokenGroup.value.map((token, index) => {
          const key = `token-group-${groupIndex}-token-${index}`
          const { flavor, itemIndex } = token
          const hasNext = itemIndex < tokenIndexes.length - 1
          const compareValue = props.showCorrectResponse &&
            isDefined(itemIndex) &&
            compared[itemIndex]

          const blanksId = `${contentId}-${itemIndex}`
          const blankStyle = isTable
            ? { borderWidth: 0.5 }
            : null

          if (ClozeHelpers.isBlank(flavor)) {
            return (
              <ClozeRendererBlank
                key={key}
                blanksId={blanksId}
                compare={compareValue}
                color={dimensionColor}
                original={token.value}
                style={blankStyle}
                hasNext={hasNext}
                hasPrefix={token.hasPre}
                hasSuffix={token.hasSuf}
                pattern={tokenGroup.pattern}
                onSubmit={text => {
                  if (text) {
                    submitText({ text, index: itemIndex })
                  }
                }}
              />
            )
          }

          if (ClozeHelpers.isEmpty(flavor)) {
            return (
              <ClozeRendererBlank
                key={key}
                blanksId={blanksId}
                compare={undefined}
                color={dimensionColor}
                original={token.value}
                style={blankStyle}
                hasNext={hasNext}
                hasPrefix={token.hasPre}
                hasSuffix={token.hasSuf}
                pattern={tokenGroup.pattern}
                onSubmit={() => {}}
              />
            )
          }

          if (ClozeHelpers.isSelect(flavor)) {
            return (
              <ClozeRendererSelect
                key={key}
                color={dimensionColor}
                style={styles.token}
                value={itemIndex in entered ? entered[itemIndex] : null}
                compare={compareValue}
                options={token.value}
                onSelect={(option, index) => submitText({
                  text: index,
                  index: itemIndex
                })}
              />
            )
          }

          if (ClozeHelpers.isText(flavor)) {
            return (<LeaText key={index} style={styles.token}>{token.value}</LeaText>)
          }

          if (token.value) {
            return renderText(token, index)
          }

          return null
        })}
      </View>
    )
  }

  const renderCell = (entry, rowIndex, colIndex) => {
    if (entry.isToken && Array.isArray(entry.value)) {
      return renderTokenGroup(entry, `${rowIndex}${colIndex}`)
    }
    else if (!entry.isCellSkip) {
      return (
        <LeaText>{entry.value}</LeaText>
      )
    } else {
      return (<LeaText>{""}</LeaText>)
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
                  <View style={getCellStyle(hasTableBorder, entry.cellBorder)}
                        key={`row-${rowIndex}-col-${colIndex}`}>
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
            return renderText(entry, index)
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

const getCellStyle = (hasTableBorder, cellBorder) => {
  if (hasTableBorder) {
    return mergeStyles(styles.cell, styles.cellBorder)
  }
  if (cellBorder === 'top') {
    return mergeStyles(styles.cell, styles.cellBorderTop)
  }
  if (cellBorder === 'bottom') {
    return mergeStyles(styles.cell, styles.cellBorderBottom)
  }

  return styles.cell
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
    padding: 2,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderColor: '#00f'
  },
  word: {
    ...Layout.defaultFont(),
    padding: 1,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderColor: '#0f0'
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
    flex: 1,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellBorder: {
    borderWidth: 1,
    borderColor: Colors.light,
  },
  cellBorderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  }
})
