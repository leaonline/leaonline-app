import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Choice } from './Choice'
import { CompareState } from '../utils/CompareState'
import { Checkbox } from '../../components/Checkbox'
import { Colors } from '../../constants/Colors'
import { Log } from '../../infrastructure/Log'

const debug = Log.create('ChoiceRenderer', 'debug', true)

/**
 * Renders a SingleChoice or MultipleChoice item
 * @param props
 * @return {JSX.Element}
 * @component
 */
export const ChoiceRenderer = props => {
  const [selected, setSelected] = useState({})
  const [compared, setCompared] = useState({})

  const { contentId, showCorrectResponse, scoreResult, value } = props

  // compare responses with the correct responses when
  // the parent decided to activate {showCorrectResponse}
  useEffect(() => {
    if (!showCorrectResponse || !scoreResult) {
      return
    }

    const correctResponses = value.scoring.flatMap(sc => sc.correctResponse)
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
  }, [showCorrectResponse, scoreResult, value, selected])

  // When contentId changes we have a new element to be rendered:
  // 1. clear all selections when the content id changes
  // which happens, for example, if we move to the next page
  // 2. clear all compared
  // 3. submit a fresh 'empty' response
  useEffect(() => {
    debug('new contentId', contentId)
    setSelected({})
    setCompared({})
    props.submitResponse({
      responses: getResponses({}),
      data: props
    })
  }, [contentId])

  const { dimensionColor } = props
  const { flavor, choices } = props.value

  const selectChoice = index => {
    const update = getUpdate({ index, flavor, selected })
    setSelected(update)

    return props.submitResponse({
      responses: getResponses(update),
      data: props
    })
  }
  const toChoiceButton = (choice, index) => {
    const isSelected = !!(selected[index])
    const key = `choice-${index}`
    const onPress = () => selectChoice(index)

    return (
      <Checkbox
        key={key}
        ttsText={choice.tts}
        text={choice.text}
        hideTts={!choice.tts}
        onPress={onPress}
        checked={isSelected}
        checkedColor={Colors.secondary}
        uncheckedColor={Colors.gray}
        iconColor={dimensionColor}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
        textStyle={styles.checkboxText}
        textAlign='center'
      />
    )
  }

  const toDisabledChoiceButton = (choice, index) => {
    const compareState = compared[index]
    const isSelected = !!(selected[index])
    const isCompared = typeof compareState === 'number'
    let scoredColor

    if (isSelected && compareState === 1) {
      scoredColor = CompareState.getColor(compareState)
    }

    if (!isSelected && isCompared) {
      scoredColor = CompareState.getColor(compareState)
    }

    const key = `choice-${index}`
    return (
      <Checkbox
        key={key}
        ttsText={choice.tts}
        text={choice.text}
        hideTts={!choice.tts}
        onPress={() => {}}
        checked={isSelected || isCompared}
        checkedColor={scoredColor ?? Colors.secondary}
        uncheckedColor={Colors.gray}
        iconColor={scoredColor ?? dimensionColor}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
        textStyle={styles.checkboxText}
        textAlign='center'
      />
    )
  }

  return (
    <View style={[styles.container, props.style]}>
      {choices.map(props.showCorrectResponse ? toDisabledChoiceButton : toChoiceButton)}
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    borderWidth: 1,
    borderColor: Colors.secondary
  },
  checkboxText: {
    color: Colors.secondary,
    fontWeight: 'bold'
  }
})

const getUpdate = ({ index, flavor, selected }) => {
  // single choice: just replace index
  if (flavor === Choice.flavors.single.value) {
    return { [index]: true }
  }

  if (flavor === Choice.flavors.multiple.value) {
    // multiple choice: add/remove index
    const update = { ...selected }
    update[index] = !update[index]
    return update
  }

  throw new Error(`Unexpected flavor ${flavor}`)
}

const getResponses = (selection) => {
  const responses = []
  Object.keys(selection).forEach(index => {
    if (selection[index]) {
      responses.push(index)
    }
  })

  if (responses.length === 0) {
    responses.push('__undefined__')
  }

  return responses
}
