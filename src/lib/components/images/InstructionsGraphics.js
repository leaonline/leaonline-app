import React from 'react'
import { useTts } from '../Tts'

export const InstructionsGraphics = (props) => {
  const { Tts } = useTts()

  return (
    <Tts text={props.source.value} dontShowText={true} />
  )
}
