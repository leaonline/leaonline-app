import React from 'react'
import { View } from 'react-native'
import LeaText from '../components/LeaText'
import RouteButton from '../components/RouteButton'
import { createStyleSheet } from '../styles/createStyleSheet'

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
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
        <LeaText>CompleteScreen</LeaText>
      </View>

      <View style={styles.body}>
        <LeaText>Du hast es geschafft</LeaText>
      </View>

      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-right'
            handleScreen={() => props.navigation.navigate('Map')}
          />
        </View>
      </View>
    </View>
  )
}

export default CompleteScreen
