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
import { Units } from '../../utils/Units'

const speeds = [0.6, 0.9, 1.1]

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
  const [showIndex, setShowIndex] = useState(2)
  const { voices, voicesLoaded } = useVoices()
  const [speechRunOnce, setSpeechRunOnce] = useState(false)
  const welcomeText = t('welcomeScreen.text')
  const speedTestText = t('welcomeScreen.continue')

  if (!voicesLoaded) {
    return (
      <View style={styles.container}>
        <Loading/>
      </View>
    )
  }

  const setOnStart = () => {
    if (!speechRunOnce) {
      setSpeechRunOnce(true)
    }
  }
  const setNewVoice = (voice, index) => {
    TTSengine.stop()
    TTSengine.setVoice(voice.identifier)
    TTSengine.speakImmediately(`Stimme ${index + 1}`)
  }

  const voiceOptions = () => {
    // if there are no voices to choose from,
    // we simply skip and don't show this option at all
    if (!voices || voices.length < 2) {
      return null
    }

    const justNumbers = voices.length > 3
    const groupData = voices
      .map((voice, index) => justNumbers
          ? String(index + 1)
          : `Stimme ${index + 1}`)

    return (
      <LeaButtonGroup
        data={groupData}
        onPress={(text, index) => setNewVoice(voices[index], index)}/>
    )
  }

  const onSpeedSet = (text, index) => {
    TTSengine.stop()
    TTSengine.updateSpeed(speeds[index])
    TTSengine.speakImmediately(`Ich spreche den text für dich ${text}`)
    if (showIndex < 4) {
      setShowIndex(4)
    }
  }

  const voiceSpeedOptions = () => {
    const groupData = ['lang\u00ADsam', 'normal', 'schnell']
    return (
      <LeaButtonGroup
        data={groupData}
        onPress={onSpeedSet}/>
    )
  }

  return (
    <>
      <LeaLogo style={styles.logo}/>


      <View style={styles.container} show={showIndex}>
        <Tts id="welcomeScreen.text" style={styles.text} text={welcomeText}/>

        {voiceOptions()}

        {voiceSpeedOptions()}

        <Tts id="welcomeScreen.text" style={styles.text} text={speedTestText} align="center"/>


        <RouteButton
          title={t('common.continue')}
          block={true}
          handleScreen={() => props.navigation.navigate('termsAndConditions')}
        />
      </View>
    </>
  )
}

/**
 * @private TTS Ref
 */
const Tts = TTSengine.component()

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  logo: {
    height: 100,
    width: '100%'
  },
  container: {
    flex: 1,
    padding: Units.vw * 9,
    alignItems: 'stretch',
    justifyContent: 'space-between'
  }
})
