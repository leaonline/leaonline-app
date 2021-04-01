import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import Meteor, { Mongo, withTracker } from '@meteorrn/core';


//Meteor.connect("ws://127.0.0.1:3000/websocket");

export default function App () {
  return (
    <View style={styles.container}>
      <Text testID='textField'>Test Meteor Application</Text>
      <StatusBar style='auto' />

      <Button
        title="Press This Button"
        onPress={() => Alert.alert(Meteor.userId())}
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
});

