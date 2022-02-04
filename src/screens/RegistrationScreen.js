import React, { useState } from 'react'
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { SafeAreaView, TextInput } from 'react-native';
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { useTranslation } from 'react-i18next'
import { TTSengine } from '../components/Tts'
import { Log } from '../infrastructure/Log'
import { createUser } from '../meteor/createUser'
import RouteButton from '../components/RouteButton'
import { createSchema, RegEx } from '../schema/createSchema'

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
 * @private styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  headerr: {
    flex: 1
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
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  input: {

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
      const user = await createUser({ email })
      debug('new account:', user)
      setComplete(true)
    } catch (e) {
      console.error(e)
      debug('account creation failed')
      // TODO handle this situation
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text>Formular</Text>
      </View>

      <View style={styles.body}>
        <Tts
          id='registrationScreen.form.text'
          text={t('registrationScreen.form.text')}
          color={Colors.primary}
        />
      </View>

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
        <TouchableOpacity onPress={() => register()}>
          <Icon style={styles.iconNavigation} name='user' type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>

      <View style={styles.navigationButtons}>
        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-left' handleScreen={() => {
            TTSengine.isSpeaking
              ? Alert.alert(t('alert.title'), t('alert.navText'))
              : props.navigation.navigate('TandC')
          }}
        />

        <RouteButton
          onlyIcon
          icon='arrow-alt-circle-right' handleScreen={() => {
            TTSengine.isSpeaking
              ? Alert.alert(t('alert.title'), t('alert.navText'))
              : props.navigation.navigate('Home')
          }}
        />
      </View>
    </View>
  )
}

export default RegistrationScreen
