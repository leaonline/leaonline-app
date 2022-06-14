import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../styles/createStyleSheet'
import RouteButton from '../components/RouteButton'

/**
 * @private tts ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
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
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingTop: 10
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
        <Tts text={t('TandCScreen.text')} id='TandCScreen.text' />
      </View>

      <View style={styles.checkBox}>
        <Tts
          id='TandCScreen.checkBoxText'
          text={t('TandCScreen.checkBoxText')}
          color={termsAndConditionsColor}
          align='left'
        />
        <CheckBox
          center checked={termsAndConditionsIsChecked} onPress={checkboxHandler}
          uncheckedColor={termsAndConditionsColor}
        />
      </View>

      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            waitForSpeech
            icon='arrow-alt-circle-left'
            handleScreen={() => props.navigation.navigate('Welcome')}
          />
        </View>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            waitForSpeech
            icon='arrow-alt-circle-right'
            handleScreen={() => {
              termsAndConditionsIsChecked
                ? props.navigation.navigate('Registration')
                : checkBoxIsNotChecked()
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default TermsAndConditionsScreen
