import React from 'react'
import { InstructionAnimations } from '../../screens/unit/instructions/InstructionAnimations'
import { TTSengine, useTts } from '../Tts'
import { View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'

export const InstructionsGraphics = (props) => {
  const { Tts } = useTts()
  const Instruction = InstructionAnimations.get('choice-text')

  if (!Instruction) {
    return (
      <Tts text={props.source.value} />
    )
  }

  const readText = () => {
    TTSengine.speakImmediately(props.source.value)
  }

  return (
    <View style={styles.container}>
      <Tts text={props.source.value} color={props.color} dontShowText={true} />
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
