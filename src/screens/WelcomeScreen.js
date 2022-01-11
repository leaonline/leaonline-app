/* global ttsIsCurrentlyPlaying */
import React from 'react'
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'

const Tts = TTSengine.component()

/**
 * WelcomeScreen displays the welcome text.
 *
 * @category Screens
 * @returns {JSX.Element}
 * @constructor
 */
const WelcomeScreen = props => {
  const { t } = useTranslation()
  const headerPath = require('../assets/logo-footer.png')

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.logo} source={headerPath} />
      </View>

      <View style={styles.body}>
        <Tts text={t('welcomeScreen.text')} color={Colors.primary} id={1} testId='splashScreen1' />
      </View>

      <View style={styles.navigationButton}>
        <TouchableOpacity onPress={() => {
          ttsIsCurrentlyPlaying
            ? Alert.alert(t('alert.title'), t('alert.navText'))
            : props.navigation.navigate('TandC')
        }}
        >
          <Icon style={styles.iconNavigation} name='arrow-alt-circle-right' type='font-awesome-5' size={35} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  header: {
    flex: 1,
    alignItems: 'center',
    margin: 30
  },
  logo: {
    width: 300,
    height: 50
  },
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  icon: {
    paddingBottom: 5
  },
  navigationButton: {
    flexDirection: 'row'
  },
  iconNavigation: {
    paddingBottom: 5,
    padding: 100
  }
}
)

export default WelcomeScreen
