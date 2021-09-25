/* global ttsIsCurrentlyPlaying */
import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import { TTSengine } from '../components/Tts'

const Tts = TTSengine.component()

/**
 * RegistrationScreen displays the formular for the user registration.
 * @returns {JSX.Element}
 * @constructor
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
          ttsIsCurrentlyPlaying ? Alert.alert(t('alert.title'), t('alert.navText')) : props.navigation.navigate({ routeName: 'TandC' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-left-circle' type='feather' size={35} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying
            ? Alert.alert(t('alert.title'), t('alert.navText'))
            : props.navigation.navigate({ routeName: 'Home' })
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-right-circle' type='feather' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

RegistrationScreen.navigationOptions = (navData) => {
  return {
    headerTitle: i18n.t('registrationScreen.headerTitle'),
    headerLeft: () => null
  }
}

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
}
)

export default RegistrationScreen
