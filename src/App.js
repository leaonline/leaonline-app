import 'react-native-gesture-handler'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
// import { StatusBar } from 'expo-status-bar'
// import { Button, StyleSheet, Text, View, Alert } from 'react-native'
// import { Header } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from './HomeScreen'
import AboutScreen from './AboutScreen'

const Stack = createStackNavigator()
// import Meteor, { Mongo, withTracker } from '@meteorrn/core'
// import Meteor from '@meteorrn/core'git
// Meteor.connect("ws://127.0.0.1:3000/websocket");

export default function App () {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Home'
          component={HomeScreen}
        />
        <Stack.Screen
          name='About'
          component={AboutScreen}
        />
      </Stack.Navigator>
      {/*  <View style={styles.header}>
          <Header
            leftComponent={{ icon: 'menu', color: '#fff' }}
            centerComponent={{ text: 'lea.online Application ', style: { color: '#fff' } }}
            rightComponent={{ icon: 'home', color: '#fff' }}
          />
          <View style={styles.container}>

            <Text testID='textField'>Test Meteor Application
            </Text>
            <StatusBar style='auto' />
            <Button
              testID='Button'
              title='Press This Button, please'
              onPress={() => Alert.alert('Button is working')}
            />
          </View>
        </View> */}
    </NavigationContainer>

  )
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//
//   header: {
//     width: '100%',
//     height: '100%'
//
//   }
// })
