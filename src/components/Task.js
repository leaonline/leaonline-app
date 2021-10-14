import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import Colors from '../constants/Colors'

/**
 * TODO: add tts
 * Task contains an icon and a button.
 * @param {string} props.title: The displayed and spoken title
 * @param {string} props.icon: The icon for the button
 * @returns {JSX.Element}
 * @constructor
 */
const Task = props => {
  return (
    <View style={styles.body}>
      <Icon name='volume-up' type='font-awesome-5' color={Colors.primary} size={17} reverse style={styles.icon} />
      <Button icon={<Icon type='font-awesome-5' name={props.icon} size={25} color={Colors.primary} />} title={props.title} titleStyle={styles.buttonTitle} buttonStyle={{ borderRadius: 15 }} type='outline' />
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
    padding: 40,
    width: '75%'
  },
  icon: {
    paddingBottom: 10
  }
})

export default Task
