import React from 'react'
import { CheckBox } from 'react-native-elements'
import Colors from '../constants/Colors'
import { Pressable, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { mergeStyles } from '../styles/mergeStyles'
import { TTSengine } from './Tts'

/**
 *
 * @param props {object}
 * @param props.onPress {function}
 * @param props.text {string}
 * @param props.containerStyle {object=}
 * @param props.checked {boolean=}
 * @param props.checkedColor {string=}
 * @param props.uncheckedColor {string=}
 * @returns {JSX.Element}
 * @constructor
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
          block={true}
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
    padding: 10,
  },
})