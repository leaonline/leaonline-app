import React from 'react'
import { Text, View } from 'react-native'
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
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
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
 * On this screen the users select a current Dimension to work with,
 * which can be reading, writing etc.
 *
 * This navigates the user to the {UnitScreen}, once the corresponding Unit
 * has been loaded.
 *
 * On cancel, it navigates back to the {MapScreen}
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const DimensionScreen = props => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>DimensionScreen</Text>
      </View>

      <View style={styles.body}>
        <Text>Dimension(/Unit) auswählen</Text>
      </View>

      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-left' handleScreen={() => {
              props.navigation.navigate('Map')
            }}
          />
        </View>

        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            icon='arrow-alt-circle-right' handleScreen={() => {
              props.navigation.navigate('Unit')
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default DimensionScreen
