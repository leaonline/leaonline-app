/* global ttsIsCurrentlyPlaying */

import React, { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CheckBox, Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'

const Tts = TTSengine.component()

/**
 * TermsAndConditionsScreen displays the terms and conditions the user must agree to.
 * @returns {JSX.Element}
 * @constructor
 */
const TermsAndConditionsScreen = props => {
  // TODO move all language specific text sections to i18n file
  const TandCText = 'Hiermit stimme ich folgenden Bedingungen zu ...'
  const checkBoxText = 'Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu'
  const [termsAndConditionsIsChecked, setTermsAndConditionsCheck] = useState(false)
  const [termsAndconditionsColor, setTermsAndConditionsColor] = useState(Colors.gray)

  const checkboxHandler = () => {
    setTermsAndConditionsCheck(!termsAndConditionsIsChecked)
    setTermsAndConditionsColor(Colors.gray)
  }

  const checkBoxIsNotChecked = () => {
    // TODO also move all alert messages to i18n file
    Alert.alert('Alert', 'You need to accept the terms and conditions to continue')
    setTermsAndConditionsColor(Colors.danger)
  }

  // TODO TandCText needs to be replaced with global variable from i18n file
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Tts color={Colors.primary} text={TandCText} id={2} />
      </View>

      <View style={styles.checkBox}>
        <Tts color={termsAndconditionsColor} text={checkBoxText} align='left' id={3} />
        <CheckBox
          iconRight checked={termsAndConditionsIsChecked} onPress={checkboxHandler}
          uncheckedColor={termsAndconditionsColor}
        />
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
              : checkBoxIsNotChecked()
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
