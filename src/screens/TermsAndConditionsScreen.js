import React, { useState } from 'react'
import { View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../styles/createStyleSheet'
import RouteButton from '../components/RouteButton'
import { Confirm } from '../components/Confirm'

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
  const [showModal, setShowModal] = useState(false)
  const [termsAndConditionsColor, setTermsAndConditionsColor] = useState(Colors.gray)

  const checkboxHandler = () => {
    setTermsAndConditionsCheck(!termsAndConditionsIsChecked)
    setTermsAndConditionsColor(Colors.gray)
  }

  const showWarning = () => {
    setShowModal(true)
    setTermsAndConditionsColor(Colors.danger)
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Tts text={t('TandCScreen.text')} id='TandCScreen.text' />
      </View>

      <Confirm
        id='tac-screen-confirm'
        noButton
        question={t('alert.checkBox')}
        approveText={t('alert.approve')}
        onApprove={() => setShowModal(false)}
        icon='times'
        open={showModal}
        tts
        style={{
          borderRadius: 2,
          borderWidth: 1,
          borderColor: Colors.dark
        }}
      />

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
                : showWarning()
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default TermsAndConditionsScreen
