import React from 'react'
import { useTts } from './Tts'
import { ActionButton } from './ActionButton'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'
import { Layout } from '../constants/Layout'

/**
 * Displays a visual component with a given error or defined message.
 * If nothing is passed it renders null.
 * Optionally a confirm button incl. handler can be added.
 *
 * @category Components
 * @component
 * @param error {Error=} instance of error, message will be extracted
 * @param message {string=} custom error message
 * @param label {string=} title of the confirm button
 * @param onConfirm {function=} if given a confirm button will be rendered that triggers this fn on press
 * @returns {JSX.Element|null}
 */
export const ErrorMessage = ({ error, message, label, onConfirm }) => {
  if (!error && !message) {
    return null
  }

  const renderConfirm = () => {
    if (!onConfirm) { return null }
    return (
      <ActionButton text={label} onPress={onConfirm} />
    )
  }

  const { Tts } = useTts()

  return (
    <View style={styles.default}>
      <Tts iconColor={Colors.danger} color={Colors.danger} text={message || error.message} />
      {renderConfirm()}
    </View>
  )
}

/** @private */
const styles = createStyleSheet({
  default: {
    borderWidth: 0.5,
    padding: 10,
    borderColor: Colors.danger,
    backgroundColor: Colors.white,
    ...Layout.dropShadow()
  }
})
