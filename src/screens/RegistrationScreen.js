import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView, TextInput, ActivityIndicator, Text } from 'react-native'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { Log } from '../infrastructure/Log'
import { createUser } from '../meteor/createUser'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../styles/createStyleSheet'
import RouteButton from '../components/RouteButton'
import { createSchema, RegEx } from '../schema/createSchema'
import { ActionButton } from '../components/ActionButton'
import { loginMeteor } from '../meteor/loginMeteor'

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
const log = Log.create('RegistrationScreen')

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 15
  },
  body: {
    flex: 2,
    flexDirection: 'row',
    marginHorizontal: 32
  },
  input: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    margin: 0,
    padding: 0
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
    flex: 1,
    alignItems: 'center'
  },
  codesContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: '5%'
  },
  code: {
    flex: 2,
    flexDirection: 'row'
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
  const [user, setUser] = useState()
  const [registering, setRegistering] = useState(false)
  const [complete, setComplete] = useState(false)
  const { t } = useTranslation()

  const register = async () => {
    log('validate email, if given')

    if (email && email.length > 0) {
      const ctx = emailSchema.newContext()
      ctx.validate({ email })

      if (!ctx.isValid()) {
        return Alert.alert('invalid email')
      }
    }

    log('register account')
    try {
      setRegistering(true)
      const createdUser = await createUser({ email })
      log('new account:', createdUser && createdUser.username)

      if (createdUser) setUser(createdUser)

      await loginMeteor()
      setComplete(true)
    }

      // during user creation there are multiple errors that can occur:
      // - not connected
      // -
    catch (e) {
      console.error(e)
      log('account creation failed')

      if (e.message === 'invalidResponse') {
        // TODO handle this situation
      }

      if (e.message === 'notConnected') {
        // TODO handle this situation
      }
    }

      // we use a timeout to prevent flickering
      // in case the response was very short
    finally {
      setTimeout(() => {
        log('stop registering screen')
        setRegistering(false)
      }, 1000)
    }
  }

  const renderRegistering = () => (
    <View style={styles.container}>
      <View>
        <ActivityIndicator size="large" color={Colors.secondary}/>
      </View>
      <View style={styles.body}>
        <Tts
          id='registrationScreen.registering'
          text={t('registrationScreen.registering')}
        />
      </View>
    </View>
  )

  const renderRegistration = () => (
    <View style={styles.container}>

      {/* inform about registration process */}

      <View style={styles.body}>
        <Tts
          id='registrationScreen.form.text'
          text={t('registrationScreen.form.text')}
        />
      </View>

      {/* optional email form */}

      <SafeAreaView>
        <View style={styles.input}>
          <Tts
            id='registrationScreen.form.placeholder'
            text={t('registrationScreen.form.placeholder')}
            dontShowText
          />
          <TextInput
            style={{
              borderBottomColor: '#000000',
              borderBottomWidth: 1,
            }}
            placeholder={t('registrationScreen.form.placeholder')}
            keyboardType="email-address"
            onChangeText={onChangeEmail}
          />
        </View>
      </SafeAreaView>

      {/* REGISTER BUTTON */}

      <View style={styles.container}>
        <ActionButton
          tts={t('registrationScreen.form.register')}
          onPress={() => register()}
          disabled={true}/>
      </View>

      {/* optional: navigate back */}

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
      </View>
    </View>
  )

  const renderRestoreCodes = () => {
    const codes = user?.restore
    if (!codes?.length) return null

    return codes.map((code, index) => {
      const splitCode = code.split('').join(' ')
      return (
        <View style={styles.code} key={`registrationScreen.restoreCode-${index}`}>
          <Tts
            id={`registrationScreen.restoreCode-${index}`}
            text={splitCode}
            color={Colors.secondary}
            dontShowText
          />
          <Text style={{ fontSize: 44, color: Colors.secondary, fontWeight: 'bold' }}>{splitCode}</Text>
        </View>
      )
    })
  }

  /**
   * Rendered, once the user has completed the registration process.
   */
  const renderComplete = () => (
    <View style={styles.container}>
      <Tts
        id='registrationScreen.complete'
        text={t('registrationScreen.complete')}
      />

      <View style={styles.codesContainer}>
        {renderRestoreCodes()}
      </View>
      <View style={styles.codesContainer} />

      <View style={styles.navigationButtons}>
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            style={styles.routeButton}
            icon='arrow-alt-circle-right'
            handleScreen={() => props.navigation.navigate('Home')} />
        </View>
      </View>
    </View>
  )

  if (registering) {
    return renderRegistering()
  }

  return complete
    ? renderComplete()
    : renderRegistration()
}

export default RegistrationScreen
