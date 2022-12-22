import React from 'react'
import { Alert } from 'react-native'
import { TTSengine } from './Tts'
import { useTranslation } from 'react-i18next'
import { ActionButton } from './ActionButton'

/**
 * RouteButton is an ActionButton with a default handler
 * on press. If pressed if will apply the given navigation handler
 * (handle screen) but provides an additional check, if it has
 * to wait until speech has ended.
 *
 * @category Components
 * @param {function} props.handleScreen The screen to be navigated
 * @param {boolean} props.waitForSpeech It throws an alert that tts is still speaking and prevents the navigation, if false the tts is stopped (Default 'false')
 * @augments {ActionButton}
 * @component
 * @returns {JSX.Element}
 */
const RouteButton = props => {
  const { t } = useTranslation()

  const navigationHandler = () => {
    if (props.waitForSpeech) {
      TTSengine.isSpeaking
        ? Alert.alert(t('alert.title'), t('alert.navText'))
        : props.handleScreen()
    }
    else {
      TTSengine.stop()
      props.handleScreen()
    }
  }

  return (<ActionButton {...props} onPress={navigationHandler} />)
}

export default RouteButton
