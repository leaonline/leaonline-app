import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Vibration, View } from 'react-native'
import { InstructionAnimations } from '../instructions/InstructionAnimations'
import { useTts, TTSengine } from '../../../components/Tts'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Loading } from '../../../components/Loading'

/**
 *
 * @param props
 * @return {JSX.Element}
 * @component
 */
const InstructionsGraphicsRendererOriginal = (props) => {
  const { Tts } = useTts()
  const [loading, setLoading] = useState(false)
  const { text, subtype, color, page } = props
  const Instruction = InstructionAnimations.get(subtype)

  // XXX: we need to hack this using a timeout in order
  // to force- rerender TTS, otherwise we have a weird
  // glitch that the first tts remains across all pages
  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [text, subtype, page])

  const onInstructionPress = useCallback(() => {
    Vibration.vibrate(100)
    TTSengine.speakImmediately(text)
  }, [text])

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <Loading color={color} />
      </View>
    )
  }

  if (!Instruction) {
    return (
      <View style={styles.container}>
        <Tts iconColor={color} text={text} style={styles.tts} block />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Tts ttsText={text} color={color} dontShowText />
      <View style={styles.instructionWrapper}>
        <Instruction color={color} height={100} width={200} onPress={onInstructionPress} />
      </View>
    </View>
  )
}

export const InstructionsGraphicsRenderer = React.memo(InstructionsGraphicsRendererOriginal)

const styles = createStyleSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  loadContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tts: {
    margin: 0,
    padding: 0
  },
  instructionWrapper: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 15,
    paddingBottom: 15,
  }
})
