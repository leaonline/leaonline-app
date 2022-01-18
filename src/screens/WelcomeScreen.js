import React from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import RouteButton from '../components/RouteButton'

/**
 * @private TTS Ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
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
  }
})

/**
 * WelcomeScreen displays the welcome text as an introduction for the new
 * arrived users.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
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
        <Tts
          id='welcomeScreen.text'
          text={t('welcomeScreen.text')}
        />
      </View>

      <View style={styles.navigationButton}>
        <RouteButton
          onlyIcon
          style={{ padding: 130, paddingBottom: 5 }}
          icon='arrow-alt-circle-right' handleScreen={() => {
            TTSengine.isSpeaking
              ? Alert.alert(t('alert.title'), t('alert.navText'))
              : props.navigation.navigate('TandC')
          }}
        />
      </View>
    </View>
  )
}

export default WelcomeScreen
