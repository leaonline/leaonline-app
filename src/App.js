import { StatusBar } from 'expo-status-bar'
import React, {useEffect, useState} from 'react'
import { Button, StyleSheet, Text, View, Alert } from 'react-native'
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import {enableScreens} from 'react-native-screens';

import Navigator from "./navigation/navigator"


enableScreens();

const fetchFonts = () => {

  return Font.loadAsync({
    'semicolon': require('./assets/fonts/SemikolonPlus-Regular.ttf')

  });
};

export default function App () {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [waitThreeSeconds, setWaitThreeSeconds] = useState(false);

  useEffect(()=>{
    if (fontLoaded)
    {
      setTimeout(() => {
        setWaitThreeSeconds(true);
      }, 1000);
    }
  },[fontLoaded]);

    if (!waitThreeSeconds)
    {

      return (
          <AppLoading
              startAsync={fetchFonts}
              onFinish={() => setFontLoaded(true)}
              onError={(error) => console.warn(error)}
          />);
    }

  return (
      <View style={styles.screen}>
        <Navigator />
      </View>

  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

})
