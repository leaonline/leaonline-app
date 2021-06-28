import { StatusBar } from 'expo-status-bar'
import React, {useState} from 'react'
import { Button, StyleSheet, Text, View, Alert } from 'react-native'
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

import { Header } from 'react-native-elements'
// import Meteor, { Mongo, withTracker } from '@meteorrn/core'
// import Meteor from '@meteorrn/core'

// Meteor.connect("ws://127.0.0.1:3000/websocket");

const fetchFonts = () => {
  return Font.loadAsync({
    'semikolon': require('./assets/fonts/SemikolonPlus-Regular.ttf')
  });
};

export default function App () {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (<AppLoading startAsync={fetchFonts} onFinish={() => setFontLoaded(true)}
                        onError={(error) => console.warn(error)}/>);
  };

  return (
    <View style={styles.text}>
      <Text style={{fontFamily: 'semikolon'}}>
        Willkommen
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    textAlign: 'center'
  },
  text: {
    fontFamily: 'semikolon'
  }
})
