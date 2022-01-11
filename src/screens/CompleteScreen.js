import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'

/**
 * @private stylesheet
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  }
})

/**
 * This screen is shown, when no Units are in the queue anymore and the
 * user is to be informed about their overall progress.
 *
 * Navigates always back to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const CompleteScreen = props => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>CompleteScreen</Text>
      </View>

      <View style={styles.body}>
        <Text>Du hast es geschafft</Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          props.navigation.navigate('Map')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-left' type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CompleteScreen