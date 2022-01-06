import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'

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
          props.navigation.navigate({ routeName: 'Map' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-left' type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

CompleteScreen.navigationOptions = () => {
  return {
    headerShown: false
  }
}

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

export default CompleteScreen
