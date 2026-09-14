import React, { useState } from 'react'
import { TTSVoiceConfig } from '../../tts/TTSVoiceConfig'
import { ErrorMessage } from '../../components/ErrorMessage'
import { updateUserProfile } from '../../meteor/updateUserProfile'
import { TTSSpeedConfig } from '../../tts/TTSSpeedConfig'
import { View } from 'react-native'
import { mergeStyles } from '../../styles/mergeStyles'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'

export const TTSSettings = (props) => {
  const { Tts } = useTts()
  const { t } = useTranslation()
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
      <View style={styles.row}>
        <Tts
          text={t('profileScreen.tts.voice')}
          color={Colors.secondary}
          align='center'
          fontStyle={styles.headlineText}
          id='profileScreen.tts.voice'
        />
      </View>
      <TTSVoiceConfig
        style={styles.panel}
        onChange={voice => updateConfig({ voice })}
      />
      <View style={styles.row}>
        <Tts
          text={t('profileScreen.tts.speed')}
          color={Colors.secondary}
          align='center'
          fontStyle={styles.headlineText}
          id='profileScreen.tts.speed'
        />
      </View>
      <TTSSpeedConfig
        style={styles.panel}
        onChange={speed => updateConfig({ speed })}
      />
      <ErrorMessage error={error} />
    </View>
  )
}

const styles = createStyleSheet({
  container: Layout.container({ margin: 0 }),
  panel: {
    marginTop: 25,
    marginBottom: 25
  },
  row: {
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'center'
  }
})
