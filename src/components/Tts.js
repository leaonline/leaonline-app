import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import TitleText from './TitleText'
import Colors from '../constants/Colors'
import { asyncTimeout } from '../utils/asyncTimeout'

/** @private **/
let Speech = null

/**
 * Tts stands for Text-To-Speech. It contains an icon and the text to be spoken.
 * @param {string} props.text: The displayed and spoken text
 * @param {boolean} props.dontShowText: Determines whether the text is displayed (Default 'true')
 * @param {boolean} props.smallButton: Changes the button size from 20 to 15 (Default 'false')
 * @param {string} props.color: The color of the icon and the text, in hexadecimal format  (examples in ./constants/Colors.js)
 * @param {string} props.align: The parameter to change the text alignment ('left', 'right', 'center', 'justify')
 * @param {number} props.shrink: The parameter to shrink the text. Default: 1
 * @param {number} props.fontSize: The parameter to change the font size of the text. Default: 18
 * @param {number} props.paddingTop: Determines the top padding of the text. Default: 8
 * @param {string} props.testID: The parameter to identify the buttons for testing
 * @param {string} props.id: The parameter to identify the buttons
 * @returns {JSX.Element}
 * @constructor
 */

const ttsComponent = props => {
  const [isCurrentlyPlaying, setCurrentlyPlaying] = useState(false)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(0)
  const [ttsColorIcon, setTtsColorIcon] = useState(props.color)

  let unmounted = false

  /**
   * @deprecated use TTSEngine.isSpeaking
   **/
  global.ttsIsCurrentlyPlaying = isCurrentlyPlaying

  useEffect(() => {
    TTSengine.isSpeaking = isCurrentlyPlaying
    TTSengine.speakId = currentlyPlayingId
    TTSengine.iconColor = ttsColorIcon

    return () => {
      unmounted = true
    }
  }, [isCurrentlyPlaying])

  /**
   * Starts speaking props.text. At startup it calls the function startSpeak() and at the end its calls stopSpeak()
   */
  const speak = async () => {
    const isSpeaking = await Speech.isSpeakingAsync()

    if (isSpeaking) {
      stopSpeak()
      await asyncTimeout(5)
      return await speak()
    }

    Speech.speak(props.text, {
      language: 'ger',
      pitch: 1,
      rate: 1,
      onStart: () => startSpeak(),
      onStopped: () => stopSpeak(),
      onDone: () => stopSpeak()
    })
  }
  /**
   * Stops expo-speech and changes the color back to props.color and sets CurrentlyPlaying to false
   */
  const stopSpeak = () => {
    if (!unmounted) {
      setTtsColorIcon(props.color)
      setCurrentlyPlaying(false)
      setCurrentlyPlayingId(0)
    }
    Speech.stop()
  }
  /**
   * Changes the color of the icon to green and sets CurrentlyPlaying to true, at the start
   */
  const startSpeak = () => {
    if (!unmounted) {
      setTtsColorIcon(Colors.success)
      setCurrentlyPlaying(true)
      setCurrentlyPlayingId(props.id)
    }
  }

  /**
   * Displays the spoken text if "dontShowText" is false.
   */
  const displayedText = () => {
    if (!props.dontShowText) {
      // color always detaults to secondary and align always to left
      const styleProps = {
        color: props.color,
        flexShrink: props.shrink || 1,
        fontSize: props.fontSize || 18,
        textAlign: props.align,
        paddingTop: props.paddingTop || 8
      }

      return (<TitleText style={styleProps} text={props.text} />)
    }
  }

  return (
    <View style={styles.body}>
      <Icon
        testID={props.testId}
        reverse style={styles.icon} color={ttsColorIcon} size={props.smallButton ? 15 : 20} marginonPress={speak}
        name='volume-up'
        type='font-awesome-5'
        onPress={() => ((currentlyPlayingId === props.id) && isCurrentlyPlaying) ? stopSpeak() : speak()}
      />
      {displayedText()}
    </View>

  )
}

export const TTSengine = {
  setSpeech (s) {
    Speech = s
  },
  isSpeaking: false,
  speakId: 0,
  iconColor: null,
  component: () => ttsComponent
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row'
  },
  icon: {
    paddingBottom: 120
  }
})
