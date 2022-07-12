import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { ActionButton } from '../../components/ActionButton'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Choice } from './Choice'
import { CompareState } from '../utils/CompareState'

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

const styles = createStyleSheet({
  container: {
    width: '100%',
    marginRight: 40,
    marginLeft: 40,
    marginTop: 10,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#fff',
    // dropshadow - ios only
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    // dropshadow - android only
    elevation: 0.5
  }
})

export const ChoiceRenderer = props => {
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

    return props.submitResponse({
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
    if (props.showCorrectResponse) {
      const compareState = compared[index]
      const color = CompareState.getColor(compareState)
      const isActive = color !== undefined
      return (
        <ActionButton
          key={index}
          active={isActive}
          color={color || dimensionColor}
          text={choice.text}
          onPress={() => {}}
        />
      )
    }

    const isActive = selected[index]
    const onPress = () => selectChoice(index)
    return (
      <ActionButton
        key={index}
        active={isActive}
        color={dimensionColor}
        text={choice.text}
        onPress={onPress}
      />
    )
  }
  return (
    <View style={styles.container}>
      {choices.map(toChoiceButton)}
    </View>
  )
}

const getUpdate = ({ index, flavor, selected }) => {
  console.debug('getUpdate', { index, flavor, selected })

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
