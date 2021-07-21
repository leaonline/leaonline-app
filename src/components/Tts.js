import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import * as Speech from 'expo-speech'

import { Icon } from 'react-native-elements'
import TitleText from './TitleText'
import Colors from '../constants/Colors'

// const asyncTimeout = ms => new Promise(resolve => {
//   setTimeout(() => {
//     resolve()
//   }, ms)
// })

/**
 * Tts stands for Text-To-Speech. It contains an icon and the text to be spoken.
 * @param props:
 *          props.text: The displayed and spoken text
 *          props.color: The color of the icon and the text
 *          - contants/Colors.js
 *          props.align: The parameter to change the text alignment
 *          - ['left', 'right', 'center', 'justify']
 * @returns {JSX.Element}
 * @constructor
 */

const Tts = props => {
  const [isCurrentlyPlaying, setCurrentlyPlaying] = useState(false)
  const [ttsColorIcon, setTtsColorIcon] = useState(props.color)

  global.ttsIsCurrentlyPlaying = isCurrentlyPlaying;

  /**
     * Starts speaking props.text. At startup it calls the function startSpeak() and at the end its calls stopSpeak()
     */
  const speak = async () => {
    const isSpeaking = await Speech.isSpeakingAsync();


    if (isSpeaking) {
      //asyncTimeout(5) // wait 5 ms if not already stopped
      Alert.alert('Stop', 'Es wird noch geredet ! \nBitte warten Sie bis zu Ende gespochen wurde oder beenden Sie es vorzeitig')
    } else {
      Speech.speak(props.text, {
        language: 'ger',
        pitch: 1,
        rate: 1,
        onStart: () => startSpeak(),
        onStopped: () => stopSpeak(),
        onDone: () => stopSpeak()
      })
    }


  }
  /**
     * Stops expo-speech and changes the color back to props.color and sets CurrentlyPlaying to false
     */
  const stopSpeak = () => {
    setTtsColorIcon(props.color)
    setCurrentlyPlaying(false)
    Speech.stop()
  }
  /**
     * Changes the color of the icon to green and sets CurrentlyPlaying to true, at the start
     */
  const startSpeak = () => {
    setTtsColorIcon(Colors.success)
    setCurrentlyPlaying(true)
  }

  return (
    <View style={styles.body}>
      <Icon
        reverse style={styles.icon} color={ttsColorIcon} size={22} marginonPress={speak}
        name='volume-2'
        type='feather' onPress={() => isCurrentlyPlaying ? stopSpeak() : speak()}
      />
      <TitleText
        style={{ color: props.color, paddingLeft: 5, textAlign: props.align }}
        text={props.text}
      />
    </View>

  )
}

const styles = StyleSheet.create({
  body: {
    flex: 2,
    flexDirection: 'row',
    marginHorizontal: 32
  },
  icon: {
    paddingBottom: 5
  }
})

export default Tts
