import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { useTranslation } from 'react-i18next'
import { TTSengine } from '../components/Tts'

/**
 * @private tts
 */
const Tts = TTSengine.component()

/**
 * @private styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  header: {
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
        <Tts text='Formulartext' color={Colors.primary} id={4} testId='registrationScreen1' />
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => {
          TTSengine.isSpeaking
            ? Alert.alert(t('alert.title'), t('alert.navText'))
            : props.navigation.navigate('TandC')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-left' type='font-awesome-5' size={35} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          TTSengine.isSpeaking
            ? Alert.alert(t('alert.title'), t('alert.navText'))
            : props.navigation.navigate('Home')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-right' type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default RegistrationScreen
