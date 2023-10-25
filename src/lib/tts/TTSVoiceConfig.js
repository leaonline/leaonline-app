import React, { useState } from 'react'
import { useVoices } from '../hooks/useVoices'
import { View } from 'react-native'
import { Loading } from '../components/Loading'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { LeaButtonGroup } from '../components/LeaButtonGroup'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { isIOS } from '../utils/isIOS'

/**
 * Allows to set the voice for tts.
 * @param props {object}
 * @param props.style {object=} optional styles
 * @param props.onChange {function(voice:string):void} onChange handler, triggered when voice changed
 * @return {JSX.Element|null}
 * @component
 */
export const TTSVoiceConfig = props => {
  const { t } = useTranslation()
  const { voices, voicesLoaded, currentVoice } = useVoices()
  const [selected, setSelected] = useState(false)

  if (!voicesLoaded) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    )
  }

  // if there are no voices to choose from,
  // we simply skip and don't show this option at all
  if (!voices || voices.length < 2) {
    return null
  }

  const justNumbers = voices.length > 3
  const handleChange = (_, index) => {
    const voice = voices[index]
    const text = isIOS()
      ? voice.name
      : getName({ voice, index, justNumbers: false, t })
    setNewVoice({ voice, text })

    if (!selected) {
      setSelected(true)
    }

    if (props.onChange) {
      props.onChange(voice)
    }
  }

  const groupData = voices.map((voice, index) => {
    return getName({ voice, index, justNumbers, t })
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
      style={props.style}
      onPress={handleChange}
    />
  )
}

/**
 * Resolve the voice name for the voice,
 * based on current OS.
 * On iIOS every voice has a name, while
 * on Android they are cryptic a.f. so
 * we use only indexed names, like "Voice 1"
 * @param voice
 * @param index
 * @param justNumbers
 * @return {string|*}
 */
const getName = ({ voice, index, justNumbers, t }) => {
  if (isIOS()) {
    return voice.name
  }

  const value = index + 1
  const name = justNumbers
    ? String(value)
    : t('tts.voice', { value })

  return name
}

/**
 * Sets the given voice as new voice
 * @param voice
 * @param index
 * @param text
 */
const setNewVoice = ({ voice, index, text }) => {
  InteractionGraph.action({
    type: 'select',
    target: TTSVoiceConfig.name,
    message: 'set new voice',
    details: {
      index, voice: voice.identifier
    }
  })
  TTSengine.stop()
  TTSengine.setVoice(voice.identifier)
  TTSengine.speakImmediately(text)
}

const styles = createStyleSheet({
  container: Layout.container()
})
