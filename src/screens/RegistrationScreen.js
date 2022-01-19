import React from 'react'
import { Alert, Text, View } from 'react-native'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../styles/createStyleSheet'
import RouteButton from '../components/RouteButton'

/**
 * @private tts
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
    flexDirection: 'row',
    marginHorizontal: 32
  },
  text: {
    color: Colors.primary,
    paddingLeft: 5
  },
  icon: {
    paddingBottom: 5
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  }
})

/**
 * Displays the registration form which is required to create a new lea.online
 * account.
 *
 * On complete, it navigates the user to the {HomeScreen}.
 * On "back" if navigates back to the {TermsAnsConditionsScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const RegistrationScreen = props => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>Formular</Text>
      </View>

      <View style={styles.body}>
        <Tts
          id='registrationScreen.form.text'
          text={t('registrationScreen.form.text')}
        />
      </View>

      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            style={styles.routeButton}
            icon='arrow-alt-circle-left' handleScreen={() => {
              TTSengine.isSpeaking
                ? Alert.alert(t('alert.title'), t('alert.navText'))
                : props.navigation.navigate('TandC')
            }}
          />
        </View>

        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            style={styles.routeButton}
            icon='arrow-alt-circle-right' handleScreen={() => {
              TTSengine.isSpeaking
                ? Alert.alert(t('alert.title'), t('alert.navText'))
                : props.navigation.navigate('Home')
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default RegistrationScreen
