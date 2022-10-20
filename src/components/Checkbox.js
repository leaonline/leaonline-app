import React from 'react'
import { CheckBox } from 'react-native-elements'
import Colors from '../constants/Colors'
import { Pressable, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'
import { TTSengine } from './Tts'

/**
 * Our custom checkbox implementation, consists of
 * - an actual checkbox + state logic
 * - a tts button + text
 * - a `Pressable` around the tts to update state also when tapping the text
 *
 * @category Components
 * @component
 * @param props {object}
 * @param props.onPress {function}
 * @param props.text {string}
 * @param props.containerStyle {object=}
 * @param props.checked {boolean=}
 * @param props.checkedColor {string=}
 * @param props.uncheckedColor {string=}
 * @returns {JSX.Element}
 */
export const Checkbox = props => {
  const highlightStyle = props.highlight && { borderWidth: 1, borderColor: props.highlight }
  const containerStyle = mergeStyles(styles.checkBoxContainer, props.containerStyle, highlightStyle)
  const checkedColor = props.checkedColor ?? Colors.secondary
  const uncheckedColor = props.uncheckedColor ?? Colors.gray
  const ttsColor = props.checked ? checkedColor : uncheckedColor
  return (
    <View style={containerStyle}>
      <CheckBox
        checked={props.checked ?? false}
        onPress={props.onPress}
        containerStyle={styles.checkbox}
        checkedColor={checkedColor}
        uncheckedColor={uncheckedColor}
      />
      <Pressable style={{ flex: 1 }} onPress={props.onPress}>
        <Tts
          id={props.id}
          text={props.text}
          color={ttsColor}
          iconColor={checkedColor}
          align='center'
          block
        />
      </Pressable>
    </View>
  )
}

const Tts = TTSengine.component()

const styles = createStyleSheet({
  checkBoxContainer: {
    flex: 0,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20
  },
  checkbox: {
    padding: 10
  }
})
