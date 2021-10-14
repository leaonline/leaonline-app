import React, { useState } from 'react'
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
 * @param {string} props.color: The color of the icon and the text, in hexadecimal format  (examples in ./constants/Colors.js)
 * @param {string} props.align: The parameter to change the text alignment ('left', 'right', 'center', 'justify')
 * @param {string} props.testID: The parameter to identify the buttons for testing
 * @param {string} props.id: The parameter to identify the buttons
 * @returns {JSX.Element}
 * @constructor
 */

const ttsComponent = props => {
  const [isCurrentlyPlaying, setCurrentlyPlaying] = useState(false)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(0)
  const [ttsColorIcon, setTtsColorIcon] = useState(props.color)

  global.ttsIsCurrentlyPlaying = isCurrentlyPlaying
  TTSengine.isSpeaking = isCurrentlyPlaying
  TTSengine.speakId = currentlyPlayingId
  TTSengine.iconColor = ttsColorIcon

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
    setTtsColorIcon(props.color)
    setCurrentlyPlaying(false)
    setCurrentlyPlayingId(0)
    Speech.stop()
  }
  /**
   * Changes the color of the icon to green and sets CurrentlyPlaying to true, at the start
   */
  const startSpeak = () => {
    setTtsColorIcon(Colors.success)
    setCurrentlyPlaying(true)
    setCurrentlyPlayingId(props.id)
  }

  return (
    <View style={styles.body}>
      <Icon
        testID={props.testId}
        reverse style={styles.icon} color={ttsColorIcon} size={22} marginonPress={speak}
        name='volume-up'
        type='font-awesome-5'
        onPress={() => ((currentlyPlayingId === props.id) && isCurrentlyPlaying) ? stopSpeak() : speak()}
      />
      <TitleText
        style={{ color: props.color, paddingLeft: 1, flexShrink: 1, fontSize: 18, textAlign: props.align }}
        text={props.text}
      />
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
    flex: 1,
    flexDirection: 'row'
  },
  icon: {
    paddingBottom: 5
  }
})
