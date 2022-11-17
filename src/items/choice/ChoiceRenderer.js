import React, { useState, useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { ActionButton } from '../../components/ActionButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Choice } from './Choice'
import { CompareState } from '../utils/CompareState'
import { useTts } from '../../components/Tts'
import { mergeStyles } from '../../styles/mergeStyles'
import { LeaText } from '../../components/LeaText'
import { Checkbox } from '../../components/Checkbox'
import Colors from '../../constants/Colors'
/*
 "contentId": "DE9tqjzEE46mfjMPJ",
 "dimensionColor": "#d95a7d",
 "showCorrectResponse": false,
 "submitResponse": [Function submitResponse],
 "subtype": "choice",
 "type": "item",
 "value": Object {
 "choices": Array [
 Object {
 "text": "P",
 },
 Object {
 "text": "B",
 },
 Object {
 "text": "w",
 },
 Object {
 "text": "F",
 },
 ],
 "flavor": 1,
 "scoring": Array [
 Object {
 "competency": "LqxzYagNNtkM9uDFx",
 "correctResponse": Array [
 1,
 ],
 "requires": 1,
 },
 ],
 "shuffle": false,
 },
 "width": "12",

 */

export const ChoiceRenderer = props => {
  const [selected, setSelected] = useState({})
  const [compared, setCompared] = useState({})
  const { Tts } = useTts()

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
    const selectedStyle = isSelected
      ? { borderWidth: 1, borderColor: dimensionColor }
      : undefined
    const onPress = () => selectChoice(index)

    return (
      <Checkbox
        key={key}
        ttsText={choice.tts}
        text={choice.text}
        hideTts={!choice.tts}
        onPress={onPress}
        checked={isSelected}
        checkedColor={dimensionColor}
        uncheckedColor={Colors.gray}
        iconColor={dimensionColor}
        containerStyle={selectedStyle}
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
        textColor={Colors.dark}
        textAlign="center"
      />
    )
  }

  const toDisabledChoiceButton = (choice, index) => {
    const compareState = compared[index]
    const scoredColor = CompareState.getColor(compareState)
    const isSelected = scoredColor !== undefined
    const key = `choice-${index}`
    const selectedStyle = isSelected
      ? { borderWidth: 1, borderColor: scoredColor }
      : undefined

    return (
      <Checkbox
        key={key}
        ttsText={choice.tts}
        text={choice.text}
        hideTts={!choice.tts}
        onPress={() => {}}
        checked={isSelected}
        checkedColor={scoredColor ?? dimensionColor}
        uncheckedColor={Colors.gray}
        containerStyle={selectedStyle}
        iconColor={scoredColor ?? dimensionColor}
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
        textColor={scoredColor ?? Colors.dark}
        textAlign="center"
      />
    )
  }

  return (
    <View style={styles.container}>
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
  text: {

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
