import React, { useReducer, useState } from 'react'
import { ScrollView, View } from 'react-native'
import Colors from '../../constants/Colors'
import { TTSengine } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
import { Confirm } from '../../components/Confirm'
import { useLegal } from '../../hooks/useLegal'
import { LeaLogo } from '../../components/images/LeaLogo'
import { Units } from '../../utils/Units'
import { Checkbox } from '../../components/Checkbox'
import { Layout } from '../../constants/Layout'

const initialState = {
  termsAndConditionsIsChecked: false,
  highlightCheckbox: false
}

const reducer = (prevState, nextState) => {
  switch (nextState.type) {
    case 'terms':
      return {
        ...prevState,
        termsAndConditionsIsChecked: nextState.terms,
      }
    case 'highlight':
      return {
        ...prevState,
        highlightCheckbox: nextState.highlight
      }
  }
}

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
  const [state, dispatch] = useReducer(reducer, initialState, undefined)
  const { termsAndConditionsIsChecked, highlightCheckbox } = state
  const checkboxHandler = (type, currentValue) => {
    const options = { type, [type]: !currentValue }
    dispatch(options)

    if (type === 'terms' && !currentValue) {
      dispatch({ type: 'highlight', highlight: false })
    }
  }

  const renderTCText = () => termsAndConditions
    .map((text, index) => (
      <Tts style={styles.paragraph} text={text} block={true} key={index} align="flex-start"/>
    ))

  const handleAction = (route) => {
    if (!termsAndConditionsIsChecked) {
      return dispatch({ type: 'highlight', highlight: true })
    }
    return props.navigation.navigate(route)
  }

  return (
    <>
      <LeaLogo style={styles.logo}/>

      <View style={styles.container}>
        <Tts
          style={styles.paragraph}
          text={t('TandCScreen.text')}
          id="TandCScreen.text"
          block={true}
          align="center"/>

        <ScrollView contentContainerStyle={styles.tcContainer}>
          {renderTCText()}
        </ScrollView>

        <View style={styles.checkBoxes}>
          <Checkbox
            id="TandCScreen.checkBoxText"
            text={t('TandCScreen.checkBoxText')}
            highlight={highlightCheckbox && Colors.danger}
            checked={termsAndConditionsIsChecked}
            checkedColor={Colors.secondary}
            uncheckedColor={Colors.gray}
            onPress={() => checkboxHandler('terms', termsAndConditionsIsChecked)}/>
        </View>
        <View style={styles.decisionContainer}>
          <RouteButton
            title={t('TandCScreen.newUser')}
            align="center"
            block={true}
            containerStyle={{ flex: 1 }}
            handleScreen={() => handleAction('registration')}
          />
          <RouteButton
            title={t('TandCScreen.restoreWithCode')}
            align="center"
            block={true}
            containerStyle={{ flex: 1 }}
            handleScreen={() => handleAction('restore')}
          />
        </View>
      </View>
    </>
  )
}

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
    padding: Units.vw * 5,
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  tcContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  paragraph: {
    marginBottom: 30
  },
  logo: {
    height: 100,
    width: '100%'
  },
  checkBoxes: {
    borderTopWidth: Layout.lineWidth(0.5),
    borderColor: Colors.dark,
    paddingTop: Layout.lineWidth(20)
  },
  decisionContainer: {
    flexDirection: 'row'
  },
  highlight: { borderColor: Colors.danger, borderWidth: 1 }
})

export default TermsAndConditionsScreen
