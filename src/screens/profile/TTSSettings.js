import React, { useContext, useState } from 'react'
import { TTSVoiceConfig } from '../../tts/TTSVoiceConfig'
import { ErrorMessage } from '../../components/ErrorMessage'
import { useTranslation } from 'react-i18next'
import { useTts } from '../../components/Tts'
import { updateUserProfile } from '../../meteor/updateUserProfile'
import { TTSSpeedConfig } from '../../tts/TTSSpeedConfig'
import { View } from 'react-native'
import { mergeStyles } from '../../styles/mergeStyles'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'

export const TTSSettings = (props) => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [error, setError] = useState(null)
  const updateConfig = async ({ voice, speed }) => {
    const onError = err => setError(err)
    const onSuccess = () => setError(null)
    const updateDoc = { onError, onSuccess }

    if (typeof speed === 'number') {
      updateDoc.speed = speed
    }

    if (typeof voice === 'object') {
      updateDoc.voice = voice.identifier
    }

    if (typeof voice === 'string') {
      updateDoc.voice = voice
    }

    updateUserProfile(updateDoc)
  }

  const containerStyle = mergeStyles(styles.container, props.containerStyle)

  return (
    <View style={containerStyle}>
      <Tts text={t('tts.settings')} block={true} />
      <TTSVoiceConfig onChange={voice => updateConfig({ voice })} />
      <TTSSpeedConfig onChange={speed => updateConfig({ speed })} />
      <ErrorMessage error={error} />
    </View>
  )
}

const styles = createStyleSheet({
  container: Layout.container({ margin: 0 }),
})
