import React, { useState } from 'react'

import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CheckBox, Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import Tts from '../components/Tts'

/**
 * TermsAndConditionsScreen displays the terms and conditions the user must agree to.
 * @returns {JSX.Element}
 * @constructor
 */
const TermsAndConditionsScreen = props => {
  const TandCText = 'Hiermit stimme ich folgenden Bedingungen zu ...'
  const checkBoxText = 'Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu'
  const [termsAndConditionsIsChecked, setTermsAndConditionsCheck] = useState(false)

  const checkboxHandler = () => {
    setTermsAndConditionsCheck(!termsAndConditionsIsChecked)
  }
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Tts color={Colors.primary} text={TandCText} id={2} />
      </View>

      <View style={styles.checkBox}>
        <Tts color={Colors.gray} text={checkBoxText} align='left' id={3} />
        <CheckBox iconRight checked={termsAndConditionsIsChecked} onPress={checkboxHandler} />
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying ? Alert.alert('Stop', 'Es wird noch geredet ! \nBitte warten Sie bis zu Ende gespochen wurde oder beenden Sie es vorzeitig') : props.navigation.navigate({ routeName: 'WelcomeScreen' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-left-circle' type='feather' size={35} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying
            ? Alert.alert('Stop', 'Es wird noch geredet ! \nBitte warten Sie bis zu Ende gespochen wurde oder beenden Sie es vorzeitig')
            : termsAndConditionsIsChecked
              ? props.navigation.navigate({ routeName: 'Registration' })
              : Alert.alert('You need to accept the terms and conditions to continue')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-right-circle' type='feather' size={35} />
        </TouchableOpacity>
      </View>

    </View>
  )
}

TermsAndConditionsScreen.navigationOptions = (navData) => {
  return {
    headerTitle: 'Allgemeine Geschäftsbedingungen',
    headerLeft: () => null
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },

  header: {
    flex: 1
  },
  body: {
    flex: 2,
    flexDirection: 'row'

  },
  text: {
    color: Colors.primary,
    paddingLeft: 5
  },

  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  },
  checkBox: {
    flexDirection: 'row'
  },
  navigationButtons: {
    flexDirection: 'row'
  }
}
)

export default TermsAndConditionsScreen
