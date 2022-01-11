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
    padding: 100
  },
  navigationButtons: {
    flexDirection: 'row'
  }
})

/**
 * The MapScreen displays available "stages" (levels) of difficulty
 * in form of a bottom-up Map.
 *
 * Selecting a stage will navigate the user to the {DimensionScreen}.
 * Going back will navigate the user to the {HomeScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const MapScreen = props => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>MapScreen</Text>
      </View>

      <View style={styles.navigationButtons}>
        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-left' handleScreen={() => {
            props.navigation.navigate('Home')
          }}
        />

        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-right' handleScreen={() => {
            props.navigation.navigate('Dimension')
          }}
        />
      </View>
    </View>
  )
}

export default MapScreen
