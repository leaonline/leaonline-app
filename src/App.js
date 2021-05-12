import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Button, StyleSheet, Text, View, Alert } from 'react-native'
import { Header } from 'react-native-elements'
// import Meteor, { Mongo, withTracker } from '@meteorrn/core'
// import Meteor from '@meteorrn/core'

// Meteor.connect("ws://127.0.0.1:3000/websocket");

export default function App () {
  return (
    <View style={styles.container}>
      <Text testID='textField'>Test Meteor Application
      
      <Header
        leftComponent={{ icon: 'menu', color: '#fff' }}
        centerComponent={{ text: 'MY TITLE', style: { color: '#fff' } }}
        rightComponent={{ icon: 'home', color: '#fff' }}
      />
      </Text>
      <StatusBar style='auto' />

      

      <Button
        testID='Button'
        title='Press This Button, please'
        onPress={() => Alert.alert('Button is working')}
      />
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
