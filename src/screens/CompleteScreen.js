import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import RouteButton from '../components/RouteButton'

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
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 50
  },
  navigationButtons: {
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
        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-right' handleScreen={() => {
            props.navigation.navigate('Map')
          }}
        />
      </View>
    </View>
  )
}

export default CompleteScreen
