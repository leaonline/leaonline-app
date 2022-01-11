/* global ttsIsCurrentlyPlaying */
import React, { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CheckBox, Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'

/**
 * @private tts ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  },
  checkBox: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  navigationButtons: {
    flexDirection: 'row'
  }
})

/**
 * TermsAndConditionsScreen displays the terms and conditions
 * the user must agree to use this application.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
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
          center checked={termsAndConditionsIsChecked} onPress={checkboxHandler}
          uncheckedColor={termsAndConditionsColor}
        />
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying ? Alert.alert(t('alert.title'), t('alert.navText')) : props.navigation.navigate('Welcome')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-left' type='font-awesome-5' size={35} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying
            ? Alert.alert(t('alert.title'), t('alert.navText'))
            : termsAndConditionsIsChecked
              ? props.navigation.navigate('Registration')
              : checkBoxIsNotChecked()
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-right' type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TermsAndConditionsScreen
