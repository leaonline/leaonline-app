import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import { TTSengine } from '../components/Tts'
import Colors from '../constants/Colors'

/**
 * @private
 */
const Tts = TTSengine.component()

/**
 * @private
 */
const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonTitle: {
    color: Colors.primary,
    padding: 30,
    width: '75%'
  },
  button: {
    paddingTop: 5
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  }
})

/**
 * ActionButton contains a TTS and a button and a handler for the action.
 * It renders with default styles.
 *
 * @category Components
 * @param {string} props.title: The displayed and spoken title
 * @param {string} props.icon: The icon for the button
 * @param {function} props.handleScreen The screen to be navigated
 * @param {boolean} props.onlyIcon Determine whether only one icon is displayed (Default 'false')
 * @component
 * @returns {JSX.Element}
 */
export const ActionButton = props => {
  const ttsText = props.tts || props.text
  return (
    <View style={styles.body}>
      <Tts text={ttsText} color={Colors.primary} id={`${ttsText}-tts`}
           dontShowText/>
      <View style={styles.button}>
        <Button
          title={props.text || props.tts}
          titleStyle={styles.buttonTitle}
          buttonStyle={{ borderRadius: 15, paddingTop: 10 }}
          type='outline'
          onPress={props.onPress}/>
      </View>
    </View>
  )
}
