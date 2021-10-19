import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import { TTSengine } from '../components/Tts'
import Colors from '../constants/Colors'

const Tts = TTSengine.component()

/**
 * RouteButton contains an icon and a button.
 * @param {string} props.title: The displayed and spoken title
 * @param {string} props.icon: The icon for the button
 * @param {function} props.screen The screen to be navigated
 * @returns {JSX.Element}
 * @constructor
 */
const RouteButton = props => {
  return (
    <View style={styles.body}>
      <Tts text={props.title} color={Colors.primary} id={6} testId='routeButton' dontShowText={true} />
      <Button icon={<Icon type='font-awesome-5' name={props.icon} size={25} color={Colors.primary} />} title={props.title} titleStyle={styles.buttonTitle} buttonStyle={{ borderRadius: 15 }} type='outline' onPress={props.screen} />
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonTitle: {
    color: Colors.primary,
    padding: 30,
    width: '75%'
  }
})

export default RouteButton
