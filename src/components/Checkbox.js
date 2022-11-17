import React from 'react'
import { CheckBox } from 'react-native-elements'
import Colors from '../constants/Colors'
import { Pressable, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'
import { useTts } from './Tts'
import { LeaText } from './LeaText'

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
 * @param props.ttsText {string=} optional tts text to read
 * @param props.hideTts {boolean=} optional flag to hide tts
 * @param props.containerStyle {object=}
 * @param props.checked {boolean=}
 * @param props.checkedColor {string=}
 * @param props.iconColor {string=}
 * @param props.uncheckedColor {string=}
 * @param props.checkedIcon {string=}
 * @param props.uncheckedIcon {string=}
 * @returns {JSX.Element}
 */
export const Checkbox = props => {
  const { Tts } = useTts()
  const highlightStyle = props.highlight && { borderWidth: 1, borderColor: props.highlight }
  const containerStyle = mergeStyles(styles.checkBoxContainer, props.containerStyle, highlightStyle)
  const checkedColor = props.checkedColor ?? Colors.secondary
  const uncheckedColor = props.uncheckedColor ?? Colors.gray
  const textColor = props.textColor ?? Colors.dark
  const iconColor = props.iconColor ?? checkedColor
  const ttsText = props.ttsText ?? props.text

  const renderTts = () => (
    <Tts
      id={props.id}
      text={ttsText}
      color={textColor}
      iconColor={iconColor}
      align='center'
      block={true}
    />
  )

  const renderText = () => (
    <LeaText>{props.text}</LeaText>
  )

  return (
    <View style={containerStyle}>
      <CheckBox
        checked={props.checked ?? false}
        onPress={props.onPress}
        containerStyle={styles.checkbox}
        checkedColor={checkedColor}
        uncheckedColor={uncheckedColor}
        checkedIcon={props.checkedIcon}
        uncheckedIcon={props.uncheckedIcon}
      />
      <Pressable style={{ flex: 1 }} onPress={props.onPress}>
        {props.hideTts ? renderText() : renderTts() }
      </Pressable>
    </View>
  )
}

const styles = createStyleSheet({
  checkBoxContainer: {
    flex: 0,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.transparent
  },
  checkbox: {
    padding: 10
  }
})
