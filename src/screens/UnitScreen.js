import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import RouteButton from '../components/RouteButton'
import Colors from '../constants/Colors'

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
 * On this screen, the respective Unit is displayed and the users can interact
 * with it, by solving the tasks on its pages.
 *
 * If a unit is completed and there is no next unit in the queue, it navigates
 * the users to the {CompleteScreen}.
 *
 * If a next unit exists, it will load this next unit.
 *
 * On cancel, it navigates users back to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const UnitScreen = props => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>UnitScreen</Text>
      </View>

      <View style={styles.body}>
        <Text>Aufgabe</Text>
      </View>

      <View style={styles.navigationButtons}>
        <RouteButton
          onlyIcon
          style={{ paddingBottom: 5, padding: 30 }}
          icon='arrow-alt-circle-left' handleScreen={() => {
            props.navigation.navigate('Dimension')
          }}
        />

        <RouteButton
          onlyIcon
          style={{ paddingBottom: 5, padding: 30 }}
          icon='arrow-alt-circle-right' handleScreen={() => {
            props.navigation.navigate('Unit')
          }}
        />

        <RouteButton
          onlyIcon
          iconColor={Colors.success}
          style={{ paddingBottom: 5, padding: 30 }}
          icon='check-circle' handleScreen={() => {
            props.navigation.navigate('Complete')
          }}
        />
      </View>
    </View>
  )
}

export default UnitScreen
