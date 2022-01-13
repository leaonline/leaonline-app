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
        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-left' handleScreen={() => {
            props.navigation.navigate('Map')
          }}
        />

        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-right' handleScreen={() => {
            props.navigation.navigate('Unit')
          }}
        />
      </View>
    </View>
  )
}

export default DimensionScreen
