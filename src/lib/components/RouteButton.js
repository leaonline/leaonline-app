import React, { useCallback } from 'react'
import { TTSengine } from './Tts'
import { Vibration } from 'react-native'
import { ActionButton } from './ActionButton'
import { useNavigation } from '@react-navigation/native'

/**
 * RouteButton is an ActionButton with a default handler
 * on press. If pressed, it will apply the given routing.
 *
 * @category Components
 * @param props {object}
 * @param props.route {string} required route name
 * @param props.vibrate {boolean=} optional
 * @param props.stopSpeech {boolean=} optional, set to false to allow speech
 * @param props.beforeRouting {function=} optional hook to run custom
 *   actions, before routing executes. If returns false the routing will be
 *   blocked and won't execute
 * @augments {ActionButton}
 * @component
 * @returns {JSX.Element}
 */
export const RouteButton = props => {
  const { vibrate, route, stopSpeech, beforeRouting, ...rest } = props
  const navigation = useNavigation()

  const gotoRoute = useCallback(() => {
    if (vibrate !== false) {
      Vibration.vibrate(100)
    }
    navigation.navigate(route)
  }, [route, vibrate])

  const onPress = useCallback(async () => {
    let shouldRoute
    if (typeof beforeRouting === 'function') {
      shouldRoute = await beforeRouting()
    }

    if (shouldRoute !== false) {
      if (stopSpeech !== false) {
        TTSengine.stop()
      }
      gotoRoute()
    }
  }, [beforeRouting, stopSpeech])

  return (<ActionButton {...rest} onPress={onPress}/>)
}
