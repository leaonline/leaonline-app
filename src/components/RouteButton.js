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
 * RouteButton contains an icon and a button and a handler for the routing.
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
const RouteButton = props => {
  /**
   * Only displays the icon if "onlyIcon" is true.
   */
  const renderRouteButton = () => {
    if (!props.onlyIcon) {
      return (
        <View style={styles.body}>
          <Tts text={props.title} color={Colors.primary} id={6} testId='routeButton' dontShowText />
          <View style={styles.button}>
            <Button icon={<Icon type='font-awesome-5' name={props.icon} size={25} color={Colors.primary} />} title={props.title} titleStyle={styles.buttonTitle} buttonStyle={{ borderRadius: 15, paddingTop: 10 }} type='outline' onPress={props.handleScreen} />
          </View>
        </View>
      )
    } else {
      return (
        <Icon onPress={props.handleScreen} style={styles.iconNavigation} name={props.icon} type='font-awesome-5' size={35} />
      )
    }
  }

  return (
    <View style={styles.body}>
      {renderRouteButton()}
    </View>
  )
}

export default RouteButton
