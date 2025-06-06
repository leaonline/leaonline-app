import React, { useEffect } from 'react'
import { useTts } from './Tts'
import { ActionButton } from './ActionButton'
import { Image, Text, Vibration, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { i18n } from '../i18n'
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
  const { Tts } = useTts()

  useEffect(() => {
    Vibration.vibrate(100)
  }, [])

  if (!error && !message) {
    return null
  }

  const renderConfirm = () => {
    if (!onConfirm) { return null }
    return (
      <ActionButton text={label} onPress={onConfirm} />
    )
  }

  let textBase = message || error.reason || error.message || 'errors.fallback'

  if (textBase && textBase.includes('.') && i18n.hasLoadedNamespace(textBase)) {
    textBase = t(textBase)
  }

  const debugError = () => {
    return (
      <View style={styles.container} accessibilityRole='alert'>
        <Text>Debugging Info</Text>
        <Text>{`Type: ${error}`}</Text>
        <Text>{`Name: ${error.name}`}</Text>
        <Text>{`Message: ${error.message}`}</Text>
        <Text>{`Reason: ${error.reason}`}</Text>
        <Text>{`Details: ${error.details && JSON.stringify(error.details)}`}</Text>
        <Text>{`Additional msg: ${message}`}</Text>
        <Text>{`Text base: ${textBase}`}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container} accessibilityRole='alert'>
      <Tts
        text={textBase}
        fontStyle={styles.headline}
        block
        iconColor={Colors.danger}
        color={Colors.secondary}
      />
      <Image
        source={image.src}
        style={styles.image}
        accessibilityRole='image'
        resizeMethod='resize'
        resizeMode='contain'
      />
      <Tts
        text={t('errors.restart')}
        block
        iconColor={Colors.danger}
        color={Colors.secondary}
      />
      {debugError()}
      {renderConfirm()}
    </View>
  )
}

const image = {
  src: require('../../assets/images/sorry.png')
}

/** @private */
const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    padding: 15,
    borderColor: Colors.danger,
    borderWidth: 0.5,
    borderRadius: 15,
    backgroundColor: Colors.light,
    ...Layout.dropShadow()
  },
  image: {
    shrink: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 10
  },
  headline: {
    fontWeight: 'bold'
  }
})
