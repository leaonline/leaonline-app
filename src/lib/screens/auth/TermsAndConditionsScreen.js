import React, { useReducer } from 'react'
import { ScrollView, Vibration, View } from 'react-native'
import Colors from '../../constants/Colors'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
import { useLegal } from '../../hooks/useLegal'
import { LeaLogo } from '../../components/images/LeaLogo'
import { Checkbox } from '../../components/Checkbox'
import { Layout } from '../../constants/Layout'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'

const initialState = {
  termsAndConditionsIsChecked: false, highlightCheckbox: false
}

const reducer = (prevState, nextState) => {
  switch (nextState.type) {
    case 'terms':
      return {
        ...prevState, termsAndConditionsIsChecked: nextState.terms
      }
    case 'highlight':
      return {
        ...prevState, highlightCheckbox: nextState.highlight
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
    InteractionGraph.action({
      type: 'select', target: checkboxHandler.name, details: { type, value: currentValue }
    })
    const options = { type, [type]: !currentValue }
    dispatch(options)

    if (type === 'terms' && !currentValue) {
      dispatch({ type: 'highlight', highlight: false })
    }
  }

  const handleAction = (route) => {
    if (!termsAndConditionsIsChecked) {
      InteractionGraph.problem({
        type: 'missing',
        target: 'TandCScreen.checkBoxText',
        message: 'tried to continue without agreeing to terms'
      })

      dispatch({ type: 'highlight', highlight: false })
      setTimeout(() => {
        dispatch({ type: 'highlight', highlight: true })
        Vibration.vibrate(150)
      }, 300)
    }
    else {
      props.navigation.navigate(route)
    }
  }

  const renderTermsAndConditionsText = () => termsAndConditions.map((text, index) => {
    return (
      <Tts
        style={styles.paragraph}
        text={text}
        block
        key={index}
        align='flex-start'
      />
    )
  })

  return (
    <>

      <View style={styles.container}>
        <LeaLogo style={styles.logo} />

        <ScrollView contentContainerStyle={styles.tcContainer}>
          <Tts
            style={styles.introduction}
            text={t('TandCScreen.text')}
            id='TandCScreen.text'
            block
            align='center'
          />

          {renderTermsAndConditionsText()}

          <Checkbox
            id='TandCScreen.checkBoxText'
            text={t('TandCScreen.checkBoxText')}
            highlight={highlightCheckbox && Colors.danger}
            checked={termsAndConditionsIsChecked}
            checkedColor={Colors.secondary}
            uncheckedColor={Colors.gray}
            onPress={() => checkboxHandler('terms', termsAndConditionsIsChecked)}
            containerStyle={styles.checkbox}
          />

          <View style={styles.decisionContainer}>
            <RouteButton
              title={t('TandCScreen.newUser')}
              align='center'
              block
              style={styles.decisionButton}
              containerStyle={styles.decisionButton}
              handleScreen={() => handleAction('registration')}
            />
            <RouteButton
              title={t('TandCScreen.restoreWithCode')}
              align='center'
              block
              containerStyle={styles.decisionButton}
              handleScreen={() => handleAction('restore')}
            />
          </View>
        </ScrollView>
      </View>
    </>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container(), alignItems: 'stretch', justifyContent: 'space-between'
  },
  tcContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  introduction: {
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    marginBottom: 20,
    borderColor: Colors.gray
  },
  paragraph: {
    marginBottom: 10
  },
  logo: {
    height: 100, width: '100%'
  },
  checkbox: {
    borderWidth: 0.5,
    borderColor: Colors.gray
  },
  decisionContainer: {
    height: 100,
    flex: 0
  },
  decisionButton: {
    flex: 1,
    marginBottom: 10
  },
  highlight: {
    borderColor: Colors.danger,
    borderWidth: 1
  }
})

export default TermsAndConditionsScreen
