import React, { useState } from 'react'
import { useVoices } from '../hooks/useVoices'
import { View } from 'react-native'
import { Loading } from '../components/Loading'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { LeaButtonGroup } from '../components/LeaButtonGroup'
import { TTSengine } from '../components/Tts'

const setNewVoice = (voice, index) => {
  TTSengine.stop()
  TTSengine.setVoice(voice.identifier)
  TTSengine.speakImmediately(`Stimme ${index + 1}`)
}

/**
 * Allows to set the voice for tts.
 * @param props {object}
 * @param props.onChange {function(voice:string):void} onChange handler, triggered when voice changed
 * @return {JSX.Element|null}
 * @component
 */
export const TTSVoiceConfig = props => {
  const { voices, voicesLoaded, currentVoice } = useVoices()
  const [selected, setSelected] = useState(false)

  if (!voicesLoaded) {
    return (
      <View style={styles.container}>
        <Loading/>
      </View>
    )
  }

  // if there are no voices to choose from,
  // we simply skip and don't show this option at all
  if (!voices || voices.length < 2) {
    return null
  }

  const handleChange = (text, index) => {
    const newVoice = voices[index]
    setNewVoice(newVoice, index)

    if (!selected) {
      setSelected(true)
    }

    if (props.onChange) {
      props.onChange(newVoice)
    }
  }

  const justNumbers = voices.length > 3
  const groupData = voices
    .map((voice, index) => {
      const value = index + 1
      return justNumbers
        ? String(value)
        : t('tts.voice', { value })
    })

  // if we haven't selected anything yet but
  // there is an initial set voice
  // we set its index to being active
  const activeIndex = selected
    ? null
    : voices.findIndex(voice => voice.identifier === currentVoice)

  return (
    <LeaButtonGroup
      active={activeIndex}
      data={groupData}
      onPress={handleChange}
    />
  )
}

const styles = createStyleSheet({
  container: Layout.container()
})
