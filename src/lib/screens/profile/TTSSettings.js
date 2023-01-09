import React, { useState } from 'react'
import { TTSVoiceConfig } from '../../tts/TTSVoiceConfig'
import { ErrorMessage } from '../../components/ErrorMessage'
import { updateUserProfile } from '../../meteor/updateUserProfile'
import { TTSSpeedConfig } from '../../tts/TTSSpeedConfig'
import { View } from 'react-native'
import { mergeStyles } from '../../styles/mergeStyles'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'

export const TTSSettings = (props) => {
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
      <TTSVoiceConfig
        style={styles.panel}
        onChange={voice => updateConfig({ voice })}
      />
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
  }
})
