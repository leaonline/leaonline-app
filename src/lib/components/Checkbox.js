import React, { useCallback } from 'react'
import { CheckBox } from 'react-native-elements'
import { Colors } from '../constants/Colors'
import { ContentServer } from '../remotes/ContentServer'
import { Image, Pressable, View } from 'react-native'
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
 * @param props.image {string=} optional image url
 * @param props.checkedColor {string=}
 * @param props.iconColor {string=}
 * @param props.uncheckedColor {string=}
 * @param props.checkedIcon {string=}
 * @param props.uncheckedIcon {string=}
 * @param props.textColor {string=}
 * @param props.textStyle {object=}
 * @returns {JSX.Element}
 */
export const Checkbox = props => {
  const { Tts } = useTts()
  const highlightStyle = props.highlight && { borderWidth: 1, borderColor: props.highlight }
  const containerStyle = mergeStyles(styles.checkBoxContainer, props.containerStyle, highlightStyle)
  const checkedColor = props.checkedColor ?? Colors.secondary
  const uncheckedColor = props.uncheckedColor ?? Colors.gray
  const textColor = props.textColor ?? Colors.secondary
  const iconColor = props.iconColor ?? checkedColor
  const ttsText = props.ttsText ?? props.text

  const renderImage = useCallback(() => {
    const uri = ContentServer.cleanUrl(props.image)
    return (
      <Image
        accessibilityRole='image'
        style={styles.image}
        resizeMethod='resize'
        resizeMode='center'
        source={{ uri }}
      />
    )
  }, [props.image])

  const renderTts = () => (
    <Tts
      id={props.id}
      text={ttsText}
      color={textColor}
      iconColor={iconColor}
      align='center'
      block
    />
  )

  const renderText = () => (
    <LeaText style={props.textStyle}>{props.text}</LeaText>
  )

  return (
    <View style={containerStyle}>
      <CheckBox
        accessibilityRole='checkbox'
        checked={props.checked ?? false}
        onPress={props.onPress}
        containerStyle={styles.checkbox}
        checkedColor={checkedColor}
        uncheckedColor={uncheckedColor}
        checkedIcon={props.checkedIcon}
        uncheckedIcon={props.uncheckedIcon}
        textStyle={props.textStyle}
      />
      <Pressable accessibilityRole='button' style={{ flex: 1 }} onPress={props.onPress}>
        {props.hideTts ? renderText() : renderTts()}
        {props.image && renderImage()}
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
  },
  image: {
    height: 100,
    width: 100
  }
})
