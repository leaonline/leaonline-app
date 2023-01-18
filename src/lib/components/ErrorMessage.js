import React from 'react'
import { useTts } from './Tts'
import { ActionButton } from './ActionButton'
import { View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import Colors from '../constants/Colors'
import { Layout } from '../constants/Layout'
import i18n from '../i18n'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

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

  let textBase = message || error.reason || error.message || 'errors.fallback'

  if (textBase && textBase.includes('.') && i18n.hasLoadedNamespace(textBase)) {
    textBase = t(textBase)
  }

  return (
    <View style={styles.default}>
      <Tts block iconColor={Colors.danger} color={Colors.secondary} text={textBase} />
      <Tts block iconColor={Colors.danger} color={Colors.secondary} text={t('errors.restart')} />
      {renderConfirm()}
    </View>
  )
}

/** @private */
const styles = createStyleSheet({
  default: {
    padding: 15,
    borderColor: Colors.danger,
    borderWidth: 0.5,
    borderRadius: 15,
    backgroundColor: Colors.light,
    ...Layout.dropShadow()
  }
})
