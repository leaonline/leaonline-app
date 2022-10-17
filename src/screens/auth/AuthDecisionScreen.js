import React, { useState } from 'react'
import { View } from 'react-native'
import { TTSengine } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { createStyleSheet } from '../../styles/createStyleSheet'
import RouteButton from '../../components/RouteButton'
import { LeaLogo } from '../../components/images/LeaLogo'
import { Layout } from '../../constants/Layout'
import { useVoices } from '../../hooks/useVoices'
import { Loading } from '../../components/Loading'
import { LeaButtonGroup } from '../../components/LeaButtonGroup'
import { SimpleWizard } from '../../components/wizard/SimpleWizard'
/**
 * @private TTS Ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  logo: {
    height: 100,
    width: '100%'
  },
  text: {
    flex: 1
  },
  slider: {
    margin: 10
  },
  speechSettingContainer: {},
  decisionContainer: {
    flex: 1,
    padding: '10%',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly'
  }
})

const speeds = [0.5, 0.7, 0.9, 1.0, 1.15]

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
export const AuthDecisionScreen = props => {
  const { t } = useTranslation()
  const [showIndex, setShowIndex] = useState(2)
  const { voices, voicesLoaded } = useVoices()
  const [speechRunOnce, setSpeechRunOnce] = useState(false)
  const welcomeText = t('welcomeScreen.text')
  const speedTestText = t('welcomeScreen.continue')

  if (!voicesLoaded) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    )
  }

  const setOnStart = () => {
    if (!speechRunOnce) {
      setSpeechRunOnce(true)
    }
  }
  const setNewVoice = (voice, text) => {
    TTSengine.setVoice(voice.identifier)
    TTSengine.speakImmediately(text)
  }
  const setSpeed = (value, text) => {
    TTSengine.updateSpeed(speeds[value])
    TTSengine.speakImmediately(`Ich spreche den text ${text}`)
  }

  const voiceOptions = () => {
    // if there are no voices to choose from,
    // we simply skip and don't show this option at all
    if (voices.length < 2) {
      return null
    }

    const groupData = TTSengine.availableVoices.map((voice, index) => `Stimme ${index +1}` )

    return (
      <LeaButtonGroup
        data={groupData}
        onPress={(text, index) => setNewVoice(TTSengine.availableVoices[index], text)} />
    )
  }

  const onSpeedSet = (text, index) => {
    setSpeed(index, text)
    if (showIndex < 4) setShowIndex(4)
  }

  const voiceSpeedOptions = () => {
    const groupData = ['sehr langsam', 'langsam', 'normal', 'schnell', 'sehr schnell']
    return (
      <LeaButtonGroup
        data={groupData}
        onPress={onSpeedSet} />
    )
  }

  return (
    <View style={styles.container}>
      <LeaLogo style={styles.logo}/>


      <View style={styles.decisionContainer} show={showIndex}>
        <Tts id="welcomeScreen.text" style={styles.text} text={welcomeText} />

        {voiceOptions()}

        {voiceSpeedOptions()}

        <Tts id="welcomeScreen.text" style={styles.text} text={speedTestText} align="center" />


        <RouteButton
          title={t('common.continue')}
          handleScreen={() => props.navigation.navigate('termsAndConditions')}
        />
      </View>
    </View>
  )
}
