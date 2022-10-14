import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import Colors from '../../constants/Colors'
import { TTSengine } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
import { Confirm } from '../../components/Confirm'
import { Layout } from '../../constants/Layout'
import { useLegal } from '../../hooks/useLegal'

/**
 * @private tts ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
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
  const { termsAndConditions } = useLegal('terms')
  const [termsAndConditionsIsChecked, setTermsAndConditionsCheck] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [termsAndConditionsColor, setTermsAndConditionsColor] = useState(Colors.gray)

  const checkboxHandler = () => {
    const isChecked = termsAndConditionsIsChecked
    setTermsAndConditionsCheck(!termsAndConditionsIsChecked)
    setTermsAndConditionsColor(isChecked ? Colors.gray : Colors.secondary)
  }

  const renderTCText = () => {
    return termsAndConditions.map((text, index) => (<Tts text={text} key={index} /> ))
  }

  return (
    <View style={styles.container}>

      <Tts text={t('TandCScreen.text')} id='TandCScreen.text' />

      <ScrollView>
        {renderTCText()}
      </ScrollView>

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
          align='center'
        />
        <CheckBox
          center checked={termsAndConditionsIsChecked}
          onPress={checkboxHandler}
          checkedColor={termsAndConditionsColor}
          uncheckedColor={termsAndConditionsColor}
        />
      </View>

      <RouteButton
        title={t('common.continue')}
        align='center'
        disabled={!termsAndConditionsIsChecked}
        handleScreen={() => props.navigation.navigate('Registration')}
      />
    </View>
  )
}

export default TermsAndConditionsScreen
