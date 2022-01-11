import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
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
 * with it, by solving the tasks on it's pages.
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
        <TouchableOpacity onPress={() => {
          props.navigation.navigate('Dimension')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-left' type='font-awesome-5' size={35} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          props.navigation.navigate('Unit')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-right' type='font-awesome-5' size={35} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          props.navigation.navigate('Complete')
        }}
        >
          <Icon style={styles.iconNavigation} name='check-circle' color={Colors.success} type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default UnitScreen
