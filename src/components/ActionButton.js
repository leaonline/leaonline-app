import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import { TTSengine } from './Tts'
import Colors from '../constants/Colors'

/**
 * @private
 */
const Tts = TTSengine.component()

/**
 * @private
 */
const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  }
})

/**
 * ActionButton contains a TTS and a button and a handler for the action.
 * It renders with default styles.
 *
 * @category Components
 * @param {string} props.title: The displayed and spoken title
 * @param {string} props.icon: The icon for the button
 * @param {function} props.handleScreen The screen to be navigated
 * @param {boolean} props.onlyIcon Determine whether only one icon is displayed (Default 'false')
 * @component
 * @returns {JSX.Element}
 */
export const ActionButton = props => {
  const noTts = props.tts === false
  const ttsText = props.tts || props.text

  const renterTts = () => {
    if (noTts) { return null }
    return (
      <Tts
        text={ttsText} color={props.color || Colors.primary} id={`${ttsText}-tts`}
        dontShowText
      />
    )
  }

  const renderIcon = () => {
    if (!props.icon) { return null }
    return (
      <Icon
        testID={props.iconId || 'icon-id'}
        color={props.color || Colors.dark}
        size={props.iconSize || 18}
        name={props.icon}
        type='font-awesome-5'
      />
    )
  }

  const buttonStyle = { ...props.style,  }
  const titleStyle = { color: props.color || Colors.primary, width: '80%', fontFamily: 'semicolon' }

  if (props.active) {
    buttonStyle.backgroundColor = props.color
    titleStyle.color = Colors.light
  }

  return (
    <View style={styles.body}>
      {renterTts()}
      <Button
        title={props.text || props.tts}
        titleStyle={titleStyle}
        buttonStyle={buttonStyle}
        type='outline'
        onPress={props.onPress}
        icon={renderIcon()}
      />
    </View>
  )
}
