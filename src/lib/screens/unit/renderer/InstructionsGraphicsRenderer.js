import React from 'react'
import { View } from 'react-native'
import { InstructionAnimations } from '../instructions/InstructionAnimations'
import { TTSengine, useTts } from '../../../components/Tts'
import { createStyleSheet } from '../../../styles/createStyleSheet'

/**
 *
 * @param props
 * @return {JSX.Element}
 * @component
 */
export const InstructionsGraphicsRenderer = (props) => {
  const { Tts } = useTts()
  const { hash, text } = props
  const Instruction = InstructionAnimations.get(hash)

  if (!Instruction) {
    return (
      <Tts text={text} style={styles.tts} />
    )
  }

  const readText = () => {
    TTSengine.speakImmediately(text)
  }

  return (
    <View style={styles.container}>
      <Tts text={text} color={props.color} dontShowText />
      <Instruction onPress={readText} width={200} />
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  tts: {
    margin: 0,
    padding: 0
  }
})
