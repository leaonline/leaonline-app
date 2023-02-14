import React, { useEffect, useRef, useState } from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import { TextInput, View } from 'react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { TTSengine, useTts } from './Tts'

const createArray = (length, fill = '') => {
  const array = []
  array.length = length
  array.fill(fill)
  return array
}

const alphaChars = /^[A-Za-z\d]/i
/**
 * A textinput where each character is projected to one input field and focus
 * is shifted automatically after typing.
 * @category Components
 * @component
 * @param props {object}
 * @param props.length {number} the amount of cells to be rendered
 * @param props.disabled {boolean=} optional disabled state
 * @param props.onEnd {function=} called when the last field received and input
 * @param props.onNegativeEnd {function=} called when the first field received a backspace input
 * @returns {JSX.Element}
 */
export const CharacterInput = props => {
  const { Tts } = useTts()
  const [chars, setChars] = useState([])
  const refs = useRef(new Map())

  const setRef = (key, ref) => {
    if (key === 0) {
      props.refs.current[0] = ref
    }

    if (key === props.length - 1) {
      props.refs.current[1] = ref
    }

    refs.current.set(key, ref)
  }

  useEffect(() => {
    const chars = createArray(props.length, '')
    setChars(chars)
  }, [props.length])

  const handleKeyPress = (e, index) => {
    const { nativeEvent } = e
    const abort = () => {
      e.preventDefault()
      return false
    }

    if (nativeEvent.key === 'Backspace') {
      const newChars = [].concat(chars)
      const hasChar = !!newChars[index]

      // in any case we clear the current field
      // and update the chars list
      newChars[index] = ''
      setChars(newChars)

      // however, we don't jump back, if the current
      // char was deleted, because this indicates, that
      // the user may want to edit the current char
      if (hasChar) {
        return abort()
      }

      const nextRef = refs.current.get(index - 1)

      // if we habe a previous cell we jump into it
      if (nextRef) {
        nextRef.focus()
      }

      // otherwise we try to call props.onNegativeEnd
      // which can be used by parents to jump into a
      // previous row, if such exists
      else {
        refs.current.get(index).blur()

        if (props.onNegativeEnd) {
          props.onNegativeEnd()
        }
      }

      return abort()
    }

    if (!alphaChars.test(nativeEvent.key)) {
      return abort()
    }
  }

  const updateChars = (char, index) => {
    if (!char) { return }

    if (props.play) {
      TTSengine.speakImmediately(char)
    }

    const newChars = [].concat(chars)
    newChars[index] = char.toUpperCase()
    setChars(newChars)

    const nextRef = refs.current.get(index + 1)

    if (nextRef) {
      nextRef.focus()
    }
    else {
      refs.current.get(index).blur()
      if (props.onEnd) {
        props.onEnd(newChars)
      }
    }
  }

  const renderCells = () => {
    return chars.map((v, index) => {
      const key = `${props.id}-${index}`
      return (
        <TextInput
          ref={(thisComponent) => setRef(index, thisComponent)}
          onKeyPress={e => handleKeyPress(e, index)}
          style={styles.input}
          key={key}
          editable={!props.disabled}
          value={chars[index]}
          onChangeText={char => updateChars(char, index)}
          maxLength={1}
        />
      )
    })
  }

  const ttsText = chars.join(' ')
  const hasChars = ttsText.replace(/\s+/g, '').length > 0
  return (
    <View style={styles.container}>
      <Tts
        text={ttsText}
        disabled={!hasChars}
        dontShowText
        style={styles.tts}
      />
      <View style={styles.inputContainer}>
        {renderCells()}
      </View>
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  input: {
    ...Layout.input(),
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.dark,
    textAlign: 'center',
    ...Layout.defaultFont()
  },
  inputContainer: {
    flexGrow: 1,
    marginLeft: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5
  }
})
