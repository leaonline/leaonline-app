import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'

/**
 * @private styles
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
 * On cancel it navigates back to the {MapScreen}
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
        <TouchableOpacity onPress={() => {
          props.navigation.navigate('Map')
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
      </View>
    </View>
  )
}

export default DimensionScreen
