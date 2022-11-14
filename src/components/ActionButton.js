import React from 'react'
import { View } from 'react-native'
import { useTts } from './Tts'
import Colors from '../constants/Colors'
import { LeaButton } from './LeaButton'
import { mergeStyles } from '../styles/mergeStyles'
import { createStyleSheet } from '../styles/createStyleSheet'

/**
 * ActionButton contains a TTS and a button and a handler for the action.
 * It renders with default styles.
 *
 * @category Components
 * @component
 * @param {string} props.title: The displayed and spoken title
 * @param {string} props.icon: The icon for the button
 * @param {function} props.handleScreen The screen to be navigated
 * @param {boolean=} props.onlyIcon Determine whether only one icon is displayed (Default 'false')
 * @param {boolean=} props.block Display in block mode, where the button stretches over full h-space
 * @param {object=} props.containerStyle Applies / overrides additional container styles
 * @param {object=} props.buttonContainerStyle Applies / overrides additional button container styles
 * @augments LeaButton
 * @returns {JSX.Element}
 */
export const ActionButton = props => {
  const { Tts } = useTts()
  const skipTts = props.tts === false || props.noTts

  const renterTts = () => {
    if (skipTts) { return null }

    const ttsText = props.tts || props.text || props.title
    const iconColor = props.iconColor ?? props.color ?? Colors.primary
    const iconActiveColor = props.iconActiveColor ?? Colors.secondary

    return (
      <Tts text={ttsText} activeIconColor={iconActiveColor} iconColor={iconColor} color={props.color || Colors.primary} id={`${ttsText}-tts`} dontShowText />
    )
  }

  const activeStyle = props.active ? { backgroundColor: props.color, color: Colors.white } : undefined
  const blockStyle = props.block ? { flexGrow: 1 } : undefined
  const buttonProps = {
    ...props,
    title: props.title || props.text || props.tts,
    buttonStyle: mergeStyles(styles.button, props.buttonStyle, activeStyle),
    titleStyle: activeStyle,
    containerStyle: mergeStyles(styles.buttonContainer, props.buttonContainerStyle, blockStyle)
  }
  const containerStyle = mergeStyles(styles.container, props.containerStyle)
  return (
    <View style={containerStyle}>
      {renterTts()}
      <LeaButton {...buttonProps} />
    </View>
  )
}

/**
 * @private
 */
const styles = createStyleSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  button: {
    width: '100%'
  },
  buttonContainer: {
    marginLeft: 10
  }
})
