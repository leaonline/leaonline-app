import React, { useEffect, useState } from 'react'
import { useVoices } from '../hooks/useVoices'
import { View } from 'react-native'
import { Loading } from '../components/Loading'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { TTSengine } from '../components/Tts'
import { useTranslation } from 'react-i18next'
import { InteractionGraph } from '../infrastructure/log/InteractionGraph'
import { isIOS } from '../utils/isIOS'
import { LeaButton } from '../components/LeaButton'
import { Colors } from '../constants/Colors'
import { mergeStyles } from '../styles/mergeStyles'

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
  const [selected, setSelected] = useState(-1)

  // set a default voice
  useEffect(() => {
    if (selected === -1) {
      const index = voices.findIndex(v => v.identifier === currentVoice)
      if (index > -1) {
        setSelected(index)
      }
    }
  }, [voices, currentVoice])

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
  const handleChange = (index) => {
    const voice = voices[index]
    const text = isIOS()
      ? voice.name
      : getName({ voice, index, justNumbers: false, t })
    setNewVoice({ voice, text })

    if (selected !== index) {
      setSelected(index)
    }

    if (props.onChange) {
      props.onChange(voice)
    }
  }

  // if we haven't selected anything yet but
  // there is an initial set voice
  // we set its index to being active
  return (
    <View style={props.style}>
      {voices.map((voice, index) => {
        const name = getName({ voice, index, justNumbers, t })
        const buttonStyle = {
          backgroundColor: index === selected ? Colors.primary : Colors.white
        }
        return (
          <View style={styles.container} key={index}>
            <LeaButton
              title={name}
              onPress={() => handleChange(index)}
              icon='user'
              color={index === selected ? Colors.white : Colors.primary}
              buttonStyle={mergeStyles(styles.entry, buttonStyle)}
            />
          </View>
        )
      })}
    </View>
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
  const plain = t('tts.voice', { value })

  const name = justNumbers
    ? plain
    : t('tts.hello', { name: plain })

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
  container: Layout.container(),
  row: {
    flex: 1
  },
  entry: {
    padding: 20
  }
})
