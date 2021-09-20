/* global ttsIsCurrentlyPlaying */

import React, { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CheckBox, Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'

const Tts = TTSengine.component()

/**
 * TermsAndConditionsScreen displays the terms and conditions the user must agree to.
 * @returns {JSX.Element}
 * @constructor
 */
const TermsAndConditionsScreen = props => {
  const { t } = useTranslation()

  const [termsAndConditionsIsChecked, setTermsAndConditionsCheck] = useState(false)
  const [termsAndConditionsColor, setTermsAndConditionsColor] = useState(Colors.gray)

  const checkboxHandler = () => {
    setTermsAndConditionsCheck(!termsAndConditionsIsChecked)
    setTermsAndConditionsColor(Colors.gray)
  }

  const checkBoxIsNotChecked = () => {
    Alert.alert(t('alert.title'), t('alert.checkBox'))
    setTermsAndConditionsColor(Colors.danger)
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Tts color={Colors.primary} text={t('TandCScreen.text')} id={2} testId='tandc1' />
      </View>

      <View style={styles.checkBox}>
        <Tts color={termsAndConditionsColor} text={t('TandCScreen.checkBoxText')} align='left' id={3} testId='tandc2' />
        <CheckBox
          iconRight checked={termsAndConditionsIsChecked} onPress={checkboxHandler}
          uncheckedColor={termsAndConditionsColor}
        />
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying ? Alert.alert(t('alert.title'), t('alert.navText')) : props.navigation.navigate({ routeName: 'WelcomeScreen' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-left-circle' type='feather' size={35} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying
            ? Alert.alert(t('alert.title'), t('alert.navText'))
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
    headerTitle: i18n.t('TandCScreen.headerTitle'),
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
