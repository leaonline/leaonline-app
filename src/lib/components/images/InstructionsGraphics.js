import React from 'react'
import { InstructionAnimations } from '../../screens/unit/instructions/InstructionAnimations'
import { TTSengine, useTts } from '../Tts'
import { View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'

export const InstructionsGraphics = (props) => {
  const { Tts } = useTts()
  const { hash, text } = props
  const Instruction = InstructionAnimations.get(hash)

  if (!Instruction) {
    return (
      <Tts text={text} />
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
  }
})
