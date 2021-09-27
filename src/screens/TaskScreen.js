import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'

const TaskScreen = props => {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>TaskScreen</Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          props.navigation.navigate({ routeName: 'Overview' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-left-circle' type='feather' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

TaskScreen.navigationOptions = (navData) => {
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

export default TaskScreen
