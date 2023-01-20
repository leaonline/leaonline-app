import React, { useReducer } from 'react'
import { Modal, ScrollView, Vibration, View } from 'react-native'
import Colors from '../../constants/Colors'
import { TTSengine, useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
import { LeaLogo } from '../../components/images/LeaLogo'
import { Checkbox } from '../../components/Checkbox'
import { Layout } from '../../constants/Layout'
import { InteractionGraph } from '../../infrastructure/log/InteractionGraph'
import { ActionButton } from '../../components/ActionButton'
import { makeTransparent } from '../../styles/makeTransparent'
import { loadDocs } from '../../meteor/loadDocs'
import { loadTerms } from './loadTerms'
import { Markdown } from '../../components/MarkdownWithTTS'

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
  const termsDocs = loadDocs({
    fn: loadTerms
  })
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

  const onModalOpen = () => {
    InteractionGraph.action({
      type: 'select', target: 'termsModal', details: { action: 'open' }
    })
    dispatch({ type: 'modal', modalOpen: true })
  }
  const onModalClose = () => {
    TTSengine.stop()
    InteractionGraph.action({
      type: 'select', target: 'termsModal', details: { action: 'close' }
    })
    dispatch({ type: 'modal', modalOpen: false })
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
        />
        <Modal
          animationType='slide'
          transparent
          visible={state.modalOpen}
          onRequestClose={onModalClose}
        >
          <ScrollView
            contentContainerStyle={styles.modalBackground}
            persistentScrollbar
          >
            <View style={styles.modalContent}>
              <View style={styles.modalTerms}>
                {termsDocs?.data && (<Markdown value={termsDocs.data} style={styles.markdown} />)}
                <View style={styles.modalFooter}>
                  <ActionButton
                    title={t('TandCScreen.hideTerms')}
                    onPress={onModalClose}
                    block
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>

        <ActionButton
          title={t('TandCScreen.showTerms')}
          icon='file-alt'
          iconColor={Colors.primary}
          onPress={onModalOpen}
          block
        />

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
            iconColor={Colors.primary}
            containerStyle={styles.decisionButton}
            handleScreen={() => handleAction('registration')}
          />
          <RouteButton
            title={t('TandCScreen.restoreWithCode')}
            align='center'
            block
            icon='lock'
            iconColor={Colors.primary}
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
    padding: 10,
    alignItems: 'center',
    ...Layout.dropShadow()
  },
  modalFooter: {
    flex: 0,
    alignItems: 'flex-start'
  }
})

export default TermsAndConditionsScreen
