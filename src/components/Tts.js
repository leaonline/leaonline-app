import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import TTSText from './TTSText'
import Colors from '../constants/Colors'
import { asyncTimeout } from '../utils/asyncTimeout'

/** @private **/
let Speech = null

/** @private stylesheet **/
const styles = StyleSheet.create({
  body: {
    flexDirection: 'row'
  },
  icon: {
    paddingBottom: 120
  }
})

/**
 * Tts stands for Text-To-Speech. It contains an icon and the text to be spoken.
 *
 * @category Components
 * @param {string} props.text: The displayed and spoken text
 * @param {boolean} props.dontShowText: Determines whether the text is displayed (Default 'true')
 * @param {boolean} props.smallButton: Changes the button size from 20 to 15 (Default 'false')
 * @param {string} props.color: The color of the icon and the text, in hexadecimal format. Default: Colors.primary  (examples in ./constants/Colors.js)
 * @param {string} props.align: The parameter to change the text alignment ('left', 'right', 'center', 'justify')
 * @param {number} props.shrink: The parameter to shrink the text. Default: 1
 * @param {number} props.fontSize: The parameter to change the font size of the text. Default: 18
 * @param {number} props.paddingTop: Determines the top padding of the text. Default: 8
 * @param {number} props.speed: Determines the speed rate of the voice to speak. Default: 1.0
 * @param {string} props.id: The parameter to identify the buttons
 * @returns {JSX.Element}
 * @constructor
 */

const ttsComponent = props => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speakingId, setSpeakingId] = useState(0)
  const [iconColor, setIconColor] = useState(props.color || Colors.primary)

  const getIdleColor = () => props.color || Colors.primary
  const debug = props.debug || TTSengine.debug
    ? (...args) => console.debug(`[TTS](${props.id}):`, ...args)
    : () => {}

  useEffect(() => {
    debug('set isSpeaking', isSpeaking)
    TTSengine.isSpeaking = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    debug('set speakingId', speakingId)
    TTSengine.speakId = speakingId
  }, [speakingId])

  useEffect(() => {
    debug('set icon color', iconColor)
    TTSengine.iconColor = iconColor
  }, [iconColor])

  useEffect(() => {
    if (isDone) {
      debug('reset after done')
      setIconColor(getIdleColor())
      setIsSpeaking(false)
      setSpeakingId(0)
    }
  }, [isDone])

  /**
   * Starts speaking props.text. At startup it calls the function startSpeak() and at the end its calls stopSpeak()
   */
  const speak = async () => {
    const isSpeaking = await Speech.isSpeakingAsync()
    debug('speak', isSpeaking)

    if (isSpeaking) {
      stopSpeak()
      await asyncTimeout(5)
      return await speak()
    }

    Speech.speak(props.text, {
      language: 'ger',
      pitch: 1,
      rate: props.speed || 1,
      onStart: () => {
        debug('onStart')
        startSpeak()
      },
      onStopped: () => {
        debug('onStopped')
        stopSpeak()
      },
      onDone: () => {
        debug('onDone')
        setIsDone(true)
        stopSpeak()
      }
    })
  }
  /**
   * Stops expo-speech and changes the color back to props.color and sets CurrentlyPlaying to false
   */
  const stopSpeak = () => {
    debug('stop')
    setIconColor(getIdleColor())
    setIsSpeaking(false)
    setSpeakingId(0)
    setIsDone(false)
    Speech.stop()
  }
  /**
   * Changes the color of the icon to green and sets CurrentlyPlaying to true, at the start
   */
  const startSpeak = () => {
    debug('start')
    setIsSpeaking(true)
    setSpeakingId(props.id)
    setIconColor(Colors.success)
  }

  /**
   * Displays the spoken text if "dontShowText" is false.
   */
  const displayedText = () => {
    if (!props.dontShowText) {
      // color always defaults to secondary and align always to left
      const styleProps = {
        color: getIdleColor(),
        flexShrink: props.shrink || 1,
        fontSize: props.fontSize || 18,
        textAlign: props.align,
        paddingTop: props.paddingTop || 8
      }

      return (<TTSText style={styleProps} text={props.text} />)
    }
  }

  return (
    <View style={styles.body}>
      <Icon
        testID={props.id}
        reverse style={styles.icon} color={iconColor}
        size={props.smallButton ? 15 : 20} marginonPress={speak}
        name='volume-up'
        type='font-awesome-5'
        onPress={() => ((speakingId === props.id) && isSpeaking) ? stopSpeak() : speak()}
      />
      {displayedText()}
    </View>

  )
}

/**
 * Global Text-To-Speech engine. The actual tts-processor engine is injected,
 * this is only a wrapper to connect it with react components.
 *
 * Designed to have always only one instance of speech being active.
 *
 *
 * @property setSpeech {function} use to inject tts implementation
 * @property isSpeaking {boolean} indicate if currently there is a
 *  speech ongoing
 * @property speakId {number} id of the target that is used for tts
 * @property iconColor {null} current color of the speech icon
 * @property component {function} returns the react component {ttsComponent}
 * @property debug {boolean} debugs all internal tts events if true
 */
export const TTSengine = {
  setSpeech (s) {
    Speech = s
  },
  stop () {
    Speech.stop()
  },
  isSpeaking: false,
  speakId: 0,
  iconColor: null,
  debug: false,
  component: () => ttsComponent
}
