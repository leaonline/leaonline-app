import React, { useReducer } from 'react'
import { Modal, ScrollView, Vibration, View } from 'react-native'
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
import { Confirm } from '../../components/Confirm'
import { ActionButton } from '../../components/ActionButton'
import { makeTransparent } from '../../styles/makeTransparent'

const initialState = {
  termsAndConditionsIsChecked: false,
  highlightCheckbox: false,
  modalOpen: false
}

const reducer = (prevState, nextState) => {
  switch (nextState.type) {
    case 'modal':
      return {
        ...prevState,
        modalOpen: nextState.modalOpen
      }
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

  return (
    <ScrollView contentContainerStyle={styles.tcContainer}>
      <View style={styles.container}>
        <LeaLogo style={styles.logo} />

        <Tts
          style={styles.introduction}
          text={t('TandCScreen.text')}
          id='TandCScreen.text'
          block
          align='center'
        />

        <Modal
          animationType='slide'
          transparent={true}
          visible={state.modalOpen}
          onRequestClose={() => dispatch({ type: 'modal', modalOpen: false })}>
          <ScrollView
            contentContainerStyle={styles.modalBackground}
            persistentScrollbar={true}>
            <View style={styles.modalContent}>
              <View style={styles.modalTerms}>
                {termsAndConditions.map((text, index) => {
                  return (
                    <Tts
                      style={styles.paragraph}
                      text={text}
                      block
                      key={index}
                      align='flex-start'
                    />
                  )
                })}

                <View style={styles.modalFooter}>
                  <ActionButton
                    title={t('TandCScreen.hideTerms')}
                    onPress={() => dispatch({ type: 'modal', modalOpen: false })}
                    block={true} />
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>

        <ActionButton
          title={t('TandCScreen.showTerms')}
          onPress={() => dispatch({ type: 'modal', modalOpen: true })}
          block={true} />

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
            icon='user'
            containerStyle={styles.decisionButton}
            handleScreen={() => handleAction('registration')}
          />
          <RouteButton
            title={t('TandCScreen.restoreWithCode')}
            align='center'
            block
            icon='lock'
            containerStyle={styles.decisionButton}
            handleScreen={() => handleAction('restore')}
          />
        </View>
      </View>
    </ScrollView>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    alignItems: 'stretch',
    justifyContent: 'space-between',
    overflow: 'visible'
  },
  tcContainer: {

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
    height: 100,
    width: '100%'
  },
  checkbox: {
    borderWidth: 0.5,
    borderColor: Colors.gray,
    marginTop: 15,
    marginRight: 5
  },
  decisionContainer: {
    flex: 0,
    alignItems: 'center',
    overflow: 'visible',
    marginTop: 0,
    marginBottom: 10,
    paddingRight: 5
  },
  decisionButton: {
    marginTop: 5,
    marginBottom: 5
  },
  highlight: {
    borderColor: Colors.danger,
    borderWidth: 1
  },
  modalBackground: {
    flexGrow: 1,
    backgroundColor: makeTransparent(Colors.dark, 0.4)
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalTerms: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalFooter: {
    flex: 0,
    alignItems: 'flex-start'
  }
})

export default TermsAndConditionsScreen
