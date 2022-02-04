import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { SafeAreaView, TextInput } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { Log } from '../infrastructure/Log'
import { createUser } from '../meteor/createUser'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../styles/createStyleSheet'
import RouteButton from '../components/RouteButton'
import { createSchema, RegEx } from '../schema/createSchema'
import { ActionButton } from '../components/ActionButton'

const emailSchema = createSchema({
  email: {
    type: String,
    regEx: RegEx.EmailWithTLD
  }
})

/**
 * @private tts
 */
const Tts = TTSengine.component()
const debug = Log.create('RegistrationScreen', 'debug')

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
  const [email, onChangeEmail] = useState()
  const [registering, setRegistering] = useState(false)
  const [complete, setComplete] = useState(false)
  const { t } = useTranslation()

  const register = async () => {
    debug('validate email, if given')

    if (email && email.length > 0) {
      const ctx = emailSchema.newContext()
      ctx.validate({ email })

      if (!ctx.isValid()) {
        return Alert.alert('invalid email')
      }
    }

    debug('register account')
    try {
      setRegistering(true)
      const user = await createUser({ email })
      debug('new account:', user)
      setComplete(true)
    } catch (e) {
      console.error(e)
      debug('account creation failed')
      // TODO handle this situation
    } finally {
      setRegistering(false)
    }
  }

  const renderRegistration = () => (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>Formular</Text>
      </View>

      {/* inform about registration process */}

      <View style={styles.body}>
        <Tts
          id='registrationScreen.form.text'
          text={t('registrationScreen.form.text')}
        />
      </View>

      {/* optional email form */}

      <SafeAreaView>
        <TextInput
          style={{
            borderBottomColor: '#000000',
            borderBottomWidth: 1,
          }}
          placeholder={t('registrationScreen.form.placeholder')}
          keyboardType="email-address"
          onChangeText={onChangeEmail}
        />
      </SafeAreaView>

      <View>
        <ActionButton
          tts={t('registrationScreen.form.register')}
          onPress={() => register()}
          disabled={true}/>
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

  const renderComplete = () => (
    <View>

    </View>
  )

  return complete
    ? renderRegistration()
    : renderComplete()
}

export default RegistrationScreen
