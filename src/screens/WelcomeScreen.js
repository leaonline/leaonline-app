import React from 'react'
import { Image, View } from 'react-native'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../styles/createStyleSheet'
import RouteButton from '../components/RouteButton'

/**
 * @private TTS Ref
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
  navigationButton: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
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
        <View style={styles.routeButtonContainer}>
          <RouteButton
            onlyIcon
            waitForSpeech
            icon='arrow-alt-circle-right'
            handleScreen={() => props.navigation.navigate('TandC')}
          />
        </View>
      </View>
    </View>
  )
}

export default WelcomeScreen
