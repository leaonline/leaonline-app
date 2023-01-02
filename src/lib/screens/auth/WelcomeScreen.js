import React, { useState } from 'react'
import { View } from 'react-native'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
import { LeaLogo } from '../../components/images/LeaLogo'
import { TTSVoiceConfig } from '../../tts/TTSVoiceConfig'
import { TTSSpeedConfig } from '../../tts/TTSSpeedConfig'
import { Layout } from '../../constants/Layout'
import { FadePanel } from '../../components/FadePanel'

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
export const WelcomeScreen = props => {
  const { t } = useTranslation()
  const [continueAvailable, setContinueAvailable] = useState(false)
  const { Tts } = useTts()
  const welcomeText = t('welcomeScreen.text')
  const speedTestText = t('welcomeScreen.continue')

  const continueStyle = {}
  if (!continueAvailable) {
    continueStyle.opacity = 0
  }
  return (
    <View style={styles.container}>
      <LeaLogo style={styles.logo} />

      <Tts
        id='welcomeScreen.text'
        block
        style={styles.text}
        text={welcomeText}
      />

      <TTSVoiceConfig />
      <TTSSpeedConfig onChange={() => setContinueAvailable(true)} />

      <FadePanel visible={continueAvailable}>
        <Tts
          id='welcomeScreen.text'
          block
          style={styles.text}
          text={speedTestText}
          align='center'
        />
      </FadePanel>
      <FadePanel visible={continueAvailable}>
        <RouteButton
          title={t('common.continue')}
          block
          handleScreen={() => props.navigation.navigate('termsAndConditions')}
        />
      </FadePanel>
    </View>
  )
}

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  logo: {
    height: 100,
    width: '100%'
  },
  container: {
    ...Layout.container(),
    alignItems: 'stretch',
    justifyContent: 'space-between'
  }
})
