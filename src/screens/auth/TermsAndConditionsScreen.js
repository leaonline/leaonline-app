import React, { useReducer } from 'react'
import { ScrollView, View } from 'react-native'
import Colors from '../../constants/Colors'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
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
        termsAndConditionsIsChecked: nextState.terms
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
  const { Tts } = useTts()
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
      <Tts style={styles.paragraph} text={text} block key={index} align='flex-start' />
    ))

  const handleAction = (route) => {
    if (!termsAndConditionsIsChecked) {
      return dispatch({ type: 'highlight', highlight: true })
    }
    return props.navigation.navigate(route)
  }

  const renderCheckbox = () => {
    return (
      <View style={styles.checkBoxes}>
        <Checkbox
          id='TandCScreen.checkBoxText'
          text={t('TandCScreen.checkBoxText')}
          highlight={highlightCheckbox && Colors.danger}
          checked={termsAndConditionsIsChecked}
          checkedColor={Colors.secondary}
          uncheckedColor={Colors.gray}
          onPress={() => checkboxHandler('terms', termsAndConditionsIsChecked)}
        />
      </View>
    )
  }

  const renderDecision = () => {
    return (
      <View style={styles.decisionContainer}>
        <RouteButton
          title={t('TandCScreen.newUser')}
          align='center'
          block={true}
          containerStyle={{ flex: 1 }}
          handleScreen={() => handleAction('registration')}
        />
        <RouteButton
          title={t('TandCScreen.restoreWithCode')}
          align='center'
          block={true}
          containerStyle={{ flex: 1 }}
          handleScreen={() => handleAction('restore')}
        />
      </View>
    )
  }

  return (
    <>
      <LeaLogo style={styles.logo} />

      <View style={styles.container}>
        <Tts
          style={styles.paragraph}
          text={t('TandCScreen.text')}
          id='TandCScreen.text'
          block
          align='center'
        />

        <ScrollView contentContainerStyle={styles.tcContainer}>
          {renderTCText()}
        </ScrollView>

        {renderCheckbox()}
        {renderDecision()}
      </View>
    </>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  tcContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  paragraph: {
    marginBottom: 10
  },
  logo: {
    height: 100,
    width: '100%'
  },
  checkBoxes: {
    borderTopWidth: Layout.lineWidth(0.5),
    borderColor: Colors.dark,
    paddingTop: 10
  },
  decisionContainer: {
    height: 100,
    flex: 0
  },
  highlight: { borderColor: Colors.danger, borderWidth: 1 }
})

export default TermsAndConditionsScreen
